import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq, inArray, sql } from 'drizzle-orm'
import z from 'zod'
import db from '@/db'
import { categoriesTable, transactionsTable } from '@/db/schema'
import { canViewUserTransactions } from '@/lib/connection-helpers'
import { generateRecurringTransactionsForYear } from '@/data/generateRecurringTransactions'

const getCashflowSchema = z.object({
	year: z.coerce.number(),
	userIds: z.string().optional().transform((val) => {
		if (!val) return undefined
		return val.split(',').filter(Boolean)
	}),
})

export const Route = createAPIFileRoute('/api/cashflow')({
	GET: async ({ request }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const url = new URL(request.url)
			const params = {
				year: url.searchParams.get('year'),
				userIds: url.searchParams.get('userIds'),
			}

			const validated = getCashflowSchema.parse(params)
			const viewerUserId = userId
			let targetUserIds: string[]

			// Determine which users' transactions to fetch
			if (validated.userIds && validated.userIds.length > 0) {
				// Verify permission to view each user's transactions
				for (const userIdParam of validated.userIds) {
					// Allow viewing own transactions
					if (userIdParam === viewerUserId) {
						continue
					}
					// Verify permission for connected users
					const hasPermission = await canViewUserTransactions(
						viewerUserId,
						userIdParam,
					)
					if (!hasPermission) {
						return json(
							{ error: `Not authorized to view transactions for user: ${userIdParam}` },
							{ status: 403 },
						)
					}
				}
				targetUserIds = validated.userIds
			} else {
				// Default: only own transactions
				targetUserIds = [viewerUserId]
			}

			// Generate recurring transactions for each user
			for (const userIdParam of targetUserIds) {
				await generateRecurringTransactionsForYear({
					userId: userIdParam,
					year: validated.year,
				})
			}

			const cashflow = await db
				.select({
					month: sql<string>`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`,
					totalIncome: sql<string>`SUM(CASE WHEN ${categoriesTable.type} = 'income' THEN ${transactionsTable.amount} ELSE 0 END)`,
					totalExpenses: sql<string>`SUM(CASE WHEN ${categoriesTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END)`,
				})
				.from(transactionsTable)
				.leftJoin(
					categoriesTable,
					eq(transactionsTable.categoryId, categoriesTable.id),
				)
				.where(
					and(
						inArray(transactionsTable.userId, targetUserIds),
						sql`EXTRACT(YEAR FROM ${transactionsTable.transactionDate}) = ${validated.year}`,
					),
				)
				.groupBy(sql`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`)
				.orderBy(sql`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`)

			const annualCashflow: {
				month: number
				income: number
				expense: number
			}[] = []

			for (let i = 1; i <= 12; i++) {
				const monthlyCashflow = cashflow.find((cf) => Number(cf.month) === i)
				annualCashflow.push({
					month: i,
					income: Number(monthlyCashflow?.totalIncome ?? 0),
					expense: Number(monthlyCashflow?.totalExpenses ?? 0),
				})
			}

			return json(annualCashflow)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid request parameters' }, { status: 400 })
			}
			console.error('Error fetching cashflow:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
