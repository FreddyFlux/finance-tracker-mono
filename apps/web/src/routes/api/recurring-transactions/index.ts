import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { eq } from 'drizzle-orm'
import z from 'zod'
import db, { categoriesTable, recurringTransactionsTable } from '@money-saver/db'
import { recurringTransactionSchema } from '@/lib/validation'
import { getCurrentYear } from '@/lib/validation'
import { generateRecurringTransactionsForYear } from '@/data/generateRecurringTransactions'

export const Route = createFileRoute('/api/recurring-transactions/')({
	server: {
		handlers: {
			GET: async () => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const recurringTransactions = await db
						.select({
							id: recurringTransactionsTable.id,
							userId: recurringTransactionsTable.userId,
							description: recurringTransactionsTable.description,
							amount: recurringTransactionsTable.amount,
							categoryId: recurringTransactionsTable.categoryId,
							categoryName: categoriesTable.name,
							transactionType: recurringTransactionsTable.transactionType,
							repeatFrequency: recurringTransactionsTable.repeatFrequency,
							startDate: recurringTransactionsTable.startDate,
							endDate: recurringTransactionsTable.endDate,
							isActive: recurringTransactionsTable.isActive,
							createdAt: recurringTransactionsTable.createdAt,
							updatedAt: recurringTransactionsTable.updatedAt,
						})
						.from(recurringTransactionsTable)
						.leftJoin(
							categoriesTable,
							eq(recurringTransactionsTable.categoryId, categoriesTable.id),
						)
						.where(eq(recurringTransactionsTable.userId, userId))

					return Response.json(recurringTransactions)
				} catch (error) {
					console.error('Error fetching recurring transactions:', error)
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
					const validated = recurringTransactionSchema.parse(body)

					// Create the recurring transaction template
					const recurringTransaction = await db
						.insert(recurringTransactionsTable)
						.values({
							userId,
							description: validated.description,
							amount: validated.amount.toString(),
							categoryId: validated.categoryId,
							transactionType: validated.transactionType,
							repeatFrequency: validated.repeatFrequency,
							startDate: validated.startDate,
							endDate: validated.endDate ?? null,
							isActive: true,
						})
						.returning()

					// Generate transactions for the current year
					const startYear = new Date(validated.startDate).getFullYear()
					const currentYear = getCurrentYear()
					const yearToGenerate = Math.max(startYear, currentYear)

					await generateRecurringTransactionsForYear({
						userId,
						year: yearToGenerate,
					})

					return Response.json(recurringTransaction[0])
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid request body' }, { status: 400 })
					}
					console.error('Error creating recurring transaction:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
