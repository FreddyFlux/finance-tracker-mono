import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { createClerkClient } from '@clerk/backend'
import { and, eq, or } from 'drizzle-orm'
import db, { userConnectionsTable } from '@money-saver/db'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

async function getUserEmail(userId: string): Promise<string> {
	try {
		const user = await clerkClient.users.getUser(userId)
		const primaryEmail = user.emailAddresses.find(
			(email) => email.id === user.primaryEmailAddressId,
		)
		return (
			primaryEmail?.emailAddress ||
			user.emailAddresses[0]?.emailAddress ||
			userId
		)
	} catch {
		return userId
	}
}

export const Route = createFileRoute('/api/connections/for-filter')({
	server: {
		handlers: {
			GET: async () => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
					}

					const connections = await db
						.select()
						.from(userConnectionsTable)
						.where(
							and(
								or(
									eq(userConnectionsTable.requesterUserId, userId),
									eq(userConnectionsTable.recipientUserId, userId),
								),
								eq(userConnectionsTable.status, 'accepted'),
							),
						)
						.orderBy(userConnectionsTable.updatedAt)

					const otherUserIds = connections.map((conn) =>
						conn.requesterUserId === userId
							? conn.recipientUserId
							: conn.requesterUserId,
					)

					const emailMap = new Map<string, string>()
					await Promise.all(
						otherUserIds.map(async (id) => {
							const email = await getUserEmail(id)
							emailMap.set(id, email)
						}),
					)

					const currentUserEmail = await getUserEmail(userId)

					return Response.json({
						currentUserId: userId,
						currentUserEmail,
						connections: connections.map((conn) => {
							const otherUserId =
								conn.requesterUserId === userId
									? conn.recipientUserId
									: conn.requesterUserId
							return {
								id: conn.id,
								otherUserId,
								otherUserEmail: emailMap.get(otherUserId) || otherUserId,
								createdAt: conn.createdAt,
								updatedAt: conn.updatedAt,
							}
						}),
					})
				} catch (error) {
					console.error('Error fetching connections for filter:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
