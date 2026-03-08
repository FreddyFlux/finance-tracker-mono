import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { format } from 'date-fns'
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'
import z from 'zod'
import db from '@/db'
import { categoriesTable, transactionsTable } from '@/db/schema'
import { canViewUserTransactions } from '@/lib/connection-helpers'
import { TRANSACTION_LIMITS } from '@/lib/constants'
import { getCurrentYear } from '@/lib/validation'
import { sanitizeDescription } from '@/lib/sanitize'
import {
	amountSchema,
	categoryIdSchema,
	descriptionSchema,
	transactionDateStringSchema,
} from '@/lib/validation'
import { generateRecurringTransactionsForMonth } from '@/data/generateRecurringTransactions'

const getTransactionsSchema = z.object({
	month: z.coerce.number().min(1).max(12),
	year: z
		.coerce
		.number()
		.min(getCurrentYear() - TRANSACTION_LIMITS.YEAR_RANGE_OFFSET)
		.max(getCurrentYear()),
	userIds: z.string().optional().transform((val) => {
		if (!val) return undefined
		return val.split(',').filter(Boolean)
	}),
})

const createTransactionSchema = z.object({
	transactionType: z.enum(['income', 'expense']),
	categoryId: categoryIdSchema,
	transactionDate: transactionDateStringSchema,
	amount: amountSchema,
	description: descriptionSchema.transform(sanitizeDescription),
})

export const Route = createAPIFileRoute('/api/transactions')({
	GET: async ({ request }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const url = new URL(request.url)
			const params = {
				month: url.searchParams.get('month'),
				year: url.searchParams.get('year'),
				userIds: url.searchParams.get('userIds'),
			}

			const validated = getTransactionsSchema.parse(params)
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
				await generateRecurringTransactionsForMonth({
					userId: userIdParam,
					month: validated.month,
					year: validated.year,
				})
			}

			const earliestDate = new Date(validated.year, validated.month - 1, 1)
			const latestDate = new Date(validated.year, validated.month, 0)

			const transactions = await db
				.select({
					id: transactionsTable.id,
					userId: transactionsTable.userId,
					description: transactionsTable.description,
					amount: transactionsTable.amount,
					transactionDate: transactionsTable.transactionDate,
					category: categoriesTable.name,
					transactionType: categoriesTable.type,
					recurringTransactionId: transactionsTable.recurringTransactionId,
				})
				.from(transactionsTable)
				.leftJoin(
					categoriesTable,
					eq(transactionsTable.categoryId, categoriesTable.id),
				)
				.where(
					and(
						inArray(transactionsTable.userId, targetUserIds),
						gte(
							transactionsTable.transactionDate,
							format(earliestDate, 'yyyy-MM-dd'),
						),
						lte(
							transactionsTable.transactionDate,
							format(latestDate, 'yyyy-MM-dd'),
						),
					),
				)
				.orderBy(desc(transactionsTable.transactionDate))

			return json(transactions)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid request parameters' }, { status: 400 })
			}
			console.error('Error fetching transactions:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
	POST: async ({ request }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const body = await request.json()
			const validated = createTransactionSchema.parse(body)

			const transaction = await db
				.insert(transactionsTable)
				.values({
					userId,
					amount: validated.amount.toString(),
					description: validated.description,
					transactionDate: validated.transactionDate,
					categoryId: validated.categoryId,
				})
				.returning()

			return json(transaction[0])
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid request body' }, { status: 400 })
			}
			console.error('Error creating transaction:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
