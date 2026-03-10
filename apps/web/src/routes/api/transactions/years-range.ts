import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { asc, eq } from 'drizzle-orm'
import db, { transactionsTable } from '@money-saver/db'

export const Route = createFileRoute('/api/transactions/years-range')({
	server: {
		handlers: {
			GET: async () => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
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

					return Response.json(yearsRange)
				} catch (error) {
					console.error('Error fetching years range:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
