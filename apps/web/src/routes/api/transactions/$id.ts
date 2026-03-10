import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq } from 'drizzle-orm'
import z from 'zod'
import db, { categoriesTable, transactionsTable } from '@money-saver/db'
import { sanitizeDescription } from '@/lib/sanitize'
import {
	amountSchema,
	categoryIdSchema,
	descriptionSchema,
	transactionDateStringSchema,
	transactionIdSchema,
} from '@/lib/validation'

const updateTransactionSchema = z.object({
	transactionType: z.enum(['income', 'expense']),
	categoryId: categoryIdSchema,
	transactionDate: transactionDateStringSchema,
	amount: amountSchema,
	description: descriptionSchema.transform(sanitizeDescription),
})

export const Route = createFileRoute('/api/transactions/$id')({
	server: {
		handlers: {
			GET: async ({ params }) => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const id = transactionIdSchema.parse(Number(params.id))

					const [transaction] = await db
						.select({
							id: transactionsTable.id,
							userId: transactionsTable.userId,
							description: transactionsTable.description,
							amount: transactionsTable.amount,
							transactionDate: transactionsTable.transactionDate,
							categoryId: transactionsTable.categoryId,
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
								eq(transactionsTable.id, id),
								eq(transactionsTable.userId, userId),
							),
						)

					if (!transaction) {
						return Response.json({ error: 'Transaction not found' }, { status: 404 })
					}

					return Response.json(transaction)
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid transaction ID' }, { status: 400 })
					}
					console.error('Error fetching transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
			PUT: async ({ params, request }) => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const id = transactionIdSchema.parse(Number(params.id))
					const body = await request.json()
					const validated = updateTransactionSchema.parse(body)

					const [updated] = await db
						.update(transactionsTable)
						.set({
							amount: validated.amount.toString(),
							categoryId: validated.categoryId,
							transactionDate: validated.transactionDate,
							description: validated.description,
						})
						.where(
							and(
								eq(transactionsTable.id, id),
								eq(transactionsTable.userId, userId),
							),
						)
						.returning()

					if (!updated) {
						return Response.json({ error: 'Transaction not found' }, { status: 404 })
					}

					return Response.json(updated)
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid request' }, { status: 400 })
					}
					console.error('Error updating transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
			DELETE: async ({ params }) => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const id = transactionIdSchema.parse(Number(params.id))

					const [deleted] = await db
						.delete(transactionsTable)
						.where(
							and(
								eq(transactionsTable.id, id),
								eq(transactionsTable.userId, userId),
							),
						)
						.returning()

					if (!deleted) {
						return Response.json({ error: 'Transaction not found' }, { status: 404 })
					}

					return Response.json({ success: true })
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid transaction ID' }, { status: 400 })
					}
					console.error('Error deleting transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
