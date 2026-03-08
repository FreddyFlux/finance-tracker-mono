import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq, or } from 'drizzle-orm'
import z from 'zod'
import db from '@/db'
import { userConnectionsTable } from '@/db/schema'
import { connectionResponseSchema } from '@/lib/validation'

const respondToConnectionSchema = z.object({
	action: z.enum(['accept', 'reject']),
})

export const Route = createAPIFileRoute('/api/connections/$id')({
	PATCH: async ({ params, request }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const connectionId = Number(params.id)
			const body = await request.json()
			const validated = respondToConnectionSchema.parse(body)

			// Verify the connection request exists and user is the recipient
			const [connection] = await db
				.select()
				.from(userConnectionsTable)
				.where(
					and(
						eq(userConnectionsTable.id, connectionId),
						eq(userConnectionsTable.recipientUserId, userId),
						eq(userConnectionsTable.status, 'pending'),
					),
				)
				.limit(1)

			if (!connection) {
				return json(
					{ error: 'Connection request not found or already processed' },
					{ status: 404 },
				)
			}

			// Update connection status
			const newStatus = validated.action === 'accept' ? 'accepted' : 'rejected'
			const [updatedConnection] = await db
				.update(userConnectionsTable)
				.set({
					status: newStatus,
					updatedAt: new Date(),
				})
				.where(eq(userConnectionsTable.id, connectionId))
				.returning()

			return json(updatedConnection)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid request' }, { status: 400 })
			}
			console.error('Error responding to connection request:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
	DELETE: async ({ params }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const connectionId = Number(params.id)

			// Verify the connection exists and user is part of it
			const [connection] = await db
				.select()
				.from(userConnectionsTable)
				.where(
					and(
						eq(userConnectionsTable.id, connectionId),
						or(
							eq(userConnectionsTable.requesterUserId, userId),
							eq(userConnectionsTable.recipientUserId, userId),
						),
						eq(userConnectionsTable.status, 'accepted'),
					),
				)
				.limit(1)

			if (!connection) {
				return json({ error: 'Connection not found or not authorized' }, { status: 404 })
			}

			// Delete the connection
			await db.delete(userConnectionsTable).where(eq(userConnectionsTable.id, connectionId))

			return json({ success: true })
		} catch (error) {
			console.error('Error removing connection:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
