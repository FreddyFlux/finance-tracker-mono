import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq } from 'drizzle-orm'
import z from 'zod'
import db, { recurringTransactionsTable } from '@money-saver/db'
import {
	getCurrentYear,
	recurringTransactionIdSchema,
	recurringTransactionSchema,
} from '@/lib/validation'
import { generateRecurringTransactionsForYear } from '@/data/generateRecurringTransactions'

export const Route = createFileRoute('/api/recurring-transactions/$id')({
	server: {
		handlers: {
			PUT: async ({ params, request }) => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const id = recurringTransactionIdSchema.parse(Number(params.id))
					const body = await request.json()
					const validated = recurringTransactionSchema.parse(body)

					// Update the recurring transaction template
					const [updated] = await db
						.update(recurringTransactionsTable)
						.set({
							description: validated.description,
							amount: validated.amount.toString(),
							categoryId: validated.categoryId,
							transactionType: validated.transactionType,
							repeatFrequency: validated.repeatFrequency,
							startDate: validated.startDate,
							endDate: validated.endDate ?? null,
							updatedAt: new Date(),
						})
						.where(
							and(
								eq(recurringTransactionsTable.id, id),
								eq(recurringTransactionsTable.userId, userId),
							),
						)
						.returning()

					if (!updated) {
						return Response.json({ error: 'Recurring transaction not found' }, { status: 404 })
					}

					// Regenerate transactions for the current year and start year
					const startYear = new Date(validated.startDate).getFullYear()
					const currentYear = getCurrentYear()
					const yearsToGenerate = [
						Math.max(startYear, currentYear),
						startYear !== currentYear ? startYear : currentYear,
					]

					for (const year of yearsToGenerate) {
						await generateRecurringTransactionsForYear({
							userId,
							year,
						})
					}

					return Response.json(updated)
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid request' }, { status: 400 })
					}
					console.error('Error updating recurring transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
			DELETE: async ({ params }) => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const id = recurringTransactionIdSchema.parse(Number(params.id))

					const [deleted] = await db
						.delete(recurringTransactionsTable)
						.where(
							and(
								eq(recurringTransactionsTable.id, id),
								eq(recurringTransactionsTable.userId, userId),
							),
						)
						.returning()

					if (!deleted) {
						return Response.json({ error: 'Recurring transaction not found' }, { status: 404 })
					}

					return Response.json({ success: true })
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid recurring transaction ID' }, { status: 400 })
					}
					console.error('Error deleting recurring transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
			PATCH: async ({ params }) => {
				try {
					const { userId } = await auth()
					if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

					const id = recurringTransactionIdSchema.parse(Number(params.id))

					const [current] = await db
						.select({ isActive: recurringTransactionsTable.isActive })
						.from(recurringTransactionsTable)
						.where(and(
							eq(recurringTransactionsTable.id, id),
							eq(recurringTransactionsTable.userId, userId),
						))

					if (!current) return Response.json({ error: 'Recurring transaction not found' }, { status: 404 })

					const [updated] = await db
						.update(recurringTransactionsTable)
						.set({ isActive: !current.isActive, updatedAt: new Date() })
						.where(and(
							eq(recurringTransactionsTable.id, id),
							eq(recurringTransactionsTable.userId, userId),
						))
						.returning()

					return Response.json(updated)
				} catch (error) {
					console.error('Error toggling recurring transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
