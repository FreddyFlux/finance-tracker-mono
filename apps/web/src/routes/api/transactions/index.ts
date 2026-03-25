import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { format } from 'date-fns'
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'
import z from 'zod'
import db, { categoriesTable, transactionsTable } from '@money-saver/db'
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

const userIdsQueryTransform = z
	.string()
	.optional()
	.transform((val) => {
		if (!val) return undefined
		return val.split(',').filter(Boolean)
	})

const getTransactionsSchema = z.object({
	month: z.coerce.number().min(1).max(12),
	year: z
		.coerce
		.number()
		.min(getCurrentYear() - TRANSACTION_LIMITS.YEAR_RANGE_OFFSET)
		.max(getCurrentYear()),
	userIds: userIdsQueryTransform,
})

function parseRecentLimit(raw: string | null): number {
	if (raw == null || raw === '') {
		return TRANSACTION_LIMITS.RECENT_TRANSACTIONS
	}
	const n = Number(raw)
	if (Number.isNaN(n)) {
		return TRANSACTION_LIMITS.RECENT_TRANSACTIONS
	}
	return Math.min(50, Math.max(1, Math.floor(n)))
}

/** Query flag for dashboard “recent” list — avoid Zod here (Zod 4 + transforms can fail safeParse unexpectedly). */
function parseUserIdsSearchParam(raw: string | null): string[] | undefined {
	if (raw == null || raw.trim() === '') return undefined
	const ids = raw.split(',').map((s) => s.trim()).filter(Boolean)
	return ids.length > 0 ? ids : undefined
}

function getSearchParamCaseInsensitive(url: URL, key: string): string | null {
	const want = key.toLowerCase()
	for (const [name, value] of url.searchParams.entries()) {
		if (name.toLowerCase() === want) {
			return value
		}
	}
	return null
}

function isRecentTransactionsRequest(url: URL): boolean {
	const raw = getSearchParamCaseInsensitive(url, 'recent')
	if (raw === null) return false
	const v = raw
	if (v === '0' || v === 'false') return false
	// ?recent=1, ?recent=true, or ?recent / ?recent= (empty) — some clients omit the value
	return v === '1' || v === 'true' || v === ''
}

async function resolveTargetUserIds(
	viewerUserId: string,
	validatedUserIds: string[] | undefined,
): Promise<
	{ ok: true; targetUserIds: string[] } | { ok: false; response: Response }
> {
	let targetUserIds: string[]

	if (validatedUserIds && validatedUserIds.length > 0) {
		for (const userIdParam of validatedUserIds) {
			if (userIdParam === viewerUserId) {
				continue
			}
			const hasPermission = await canViewUserTransactions(viewerUserId, userIdParam)
			if (!hasPermission) {
				return {
					ok: false,
					response: Response.json(
						{ error: `Not authorized to view transactions for user: ${userIdParam}` },
						{ status: 403 },
					),
				}
			}
		}
		targetUserIds = validatedUserIds
	} else {
		targetUserIds = [viewerUserId]
	}

	return { ok: true, targetUserIds }
}

const createTransactionSchema = z.object({
	transactionType: z.enum(['income', 'expense']),
	categoryId: categoryIdSchema,
	transactionDate: transactionDateStringSchema,
	amount: amountSchema,
	description: descriptionSchema.transform(sanitizeDescription),
})

export const Route = createFileRoute('/api/transactions/')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const url = new URL(request.url)
					const viewerUserId = userId

					// Recent list (dashboard): use ?recent=1 so this is not mistaken for /api/transactions/$id ("recent").
					if (isRecentTransactionsRequest(url)) {
						const limit = parseRecentLimit(getSearchParamCaseInsensitive(url, 'limit'))
						const parsedUserIds = parseUserIdsSearchParam(
							getSearchParamCaseInsensitive(url, 'userIds'),
						)
						const resolved = await resolveTargetUserIds(viewerUserId, parsedUserIds)
						if (!resolved.ok) {
							return resolved.response
						}
						const { targetUserIds } = resolved

						const recentRows = await db
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
							.where(inArray(transactionsTable.userId, targetUserIds))
							.orderBy(desc(transactionsTable.transactionDate))
							.limit(limit)

						return Response.json(recentRows)
					}

					const params = {
						month: url.searchParams.get('month'),
						year: url.searchParams.get('year'),
						userIds: url.searchParams.get('userIds'),
					}

					const validated = getTransactionsSchema.parse(params)
					let targetUserIds: string[]

					const resolved = await resolveTargetUserIds(viewerUserId, validated.userIds)
					if (!resolved.ok) {
						return resolved.response
					}
					targetUserIds = resolved.targetUserIds

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

					return Response.json(transactions)
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid request parameters' }, { status: 400 })
					}
					console.error('Error fetching transactions:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
			POST: async ({ request }) => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
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

					return Response.json(transaction[0])
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid request body' }, { status: 400 })
					}
					console.error('Error creating transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
