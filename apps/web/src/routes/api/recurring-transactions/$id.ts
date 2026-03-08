import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq } from 'drizzle-orm'
import z from 'zod'
import db from '@/db'
import { recurringTransactionsTable } from '@/db/schema'
import {
	getCurrentYear,
	recurringTransactionIdSchema,
	recurringTransactionSchema,
} from '@/lib/validation'
import { generateRecurringTransactionsForYear } from '@/data/generateRecurringTransactions'

const updateRecurringTransactionSchema = recurringTransactionSchema.extend({
	id: recurringTransactionIdSchema,
})

const toggleRecurringTransactionSchema = z.object({
	action: z.enum(['toggle']),
})

export const Route = createAPIFileRoute('/api/recurring-transactions/$id')({
	PUT: async ({ params, request }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
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
				return json({ error: 'Recurring transaction not found' }, { status: 404 })
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

			return json(updated)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid request' }, { status: 400 })
			}
			console.error('Error updating recurring transaction:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
	DELETE: async ({ params }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
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
				return json({ error: 'Recurring transaction not found' }, { status: 404 })
			}

			return json({ success: true })
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid recurring transaction ID' }, { status: 400 })
			}
			console.error('Error deleting recurring transaction:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
