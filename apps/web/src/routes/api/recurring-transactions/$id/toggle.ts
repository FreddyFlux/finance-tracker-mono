import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq } from 'drizzle-orm'
import z from 'zod'
import db from '@/db'
import { recurringTransactionsTable } from '@/db/schema'
import { recurringTransactionIdSchema } from '@/lib/validation'

export const Route = createAPIFileRoute('/api/recurring-transactions/$id/toggle')({
	PATCH: async ({ params }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const id = recurringTransactionIdSchema.parse(Number(params.id))

			// Get current state
			const [current] = await db
				.select({ isActive: recurringTransactionsTable.isActive })
				.from(recurringTransactionsTable)
				.where(
					and(
						eq(recurringTransactionsTable.id, id),
						eq(recurringTransactionsTable.userId, userId),
					),
				)

			if (!current) {
				return json({ error: 'Recurring transaction not found' }, { status: 404 })
			}

			// Toggle isActive
			const [updated] = await db
				.update(recurringTransactionsTable)
				.set({
					isActive: !current.isActive,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(recurringTransactionsTable.id, id),
						eq(recurringTransactionsTable.userId, userId),
					),
				)
				.returning()

			return json(updated)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid recurring transaction ID' }, { status: 400 })
			}
			console.error('Error toggling recurring transaction:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
