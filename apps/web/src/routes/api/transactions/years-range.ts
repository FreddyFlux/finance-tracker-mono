import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { asc, eq, sql } from 'drizzle-orm'
import db from '@/db'
import { transactionsTable } from '@/db/schema'

export const Route = createAPIFileRoute('/api/transactions/years-range')({
	GET: async () => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const today = new Date()
			const transactions = await db
				.select({
					transactionDate: transactionsTable.transactionDate,
				})
				.from(transactionsTable)
				.where(eq(transactionsTable.userId, userId))
				.orderBy(asc(transactionsTable.transactionDate))
				.limit(1)

			const currentYear = today.getFullYear()
			const earliestYear = transactions[0]
				? new Date(transactions[0].transactionDate).getFullYear()
				: currentYear

			const yearsRange = Array.from({
				length: currentYear - earliestYear + 1,
			}).map((_, index) => {
				return currentYear - index
			})

			return json(yearsRange)
		} catch (error) {
			console.error('Error fetching years range:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
