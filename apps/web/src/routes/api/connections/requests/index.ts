import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq } from 'drizzle-orm'
import db, { userConnectionsTable } from '@money-saver/db'

export const Route = createFileRoute('/api/connections/requests/')({
	server: {
		handlers: {
			GET: async () => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					// Get all connection requests where user is the recipient and status is pending
					const requests = await db
						.select()
						.from(userConnectionsTable)
						.where(
							and(
								eq(userConnectionsTable.recipientUserId, userId),
								eq(userConnectionsTable.status, 'pending'),
							),
						)
						.orderBy(userConnectionsTable.createdAt)

					return Response.json(requests)
				} catch (error) {
					console.error('Error fetching connection requests:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
