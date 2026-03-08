import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq } from 'drizzle-orm'
import db from '@/db'
import { userConnectionsTable } from '@/db/schema'

export const Route = createAPIFileRoute('/api/connections/requests')({
	GET: async () => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
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

			return json(requests)
		} catch (error) {
			console.error('Error fetching connection requests:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
