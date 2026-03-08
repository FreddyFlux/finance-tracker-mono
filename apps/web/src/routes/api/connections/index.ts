import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq, or } from 'drizzle-orm'
import { clerkClient } from '@clerk/clerk-sdk-node'
import z from 'zod'
import db from '@/db'
import { userConnectionsTable } from '@/db/schema'
import { connectionRequestSchema } from '@/lib/validation'

export const Route = createAPIFileRoute('/api/connections')({
	GET: async () => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			// Get all accepted connections
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

			return json(connections)
		} catch (error) {
			console.error('Error fetching connections:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
	POST: async ({ request }) => {
		try {
			const { userId } = await auth()
			if (!userId) {
				return json({ error: 'Unauthorized' }, { status: 401 })
			}

			const body = await request.json()
			const validated = connectionRequestSchema.parse(body)
			const requesterUserId = userId
			let recipientUserId: string

			// Look up user by email using Clerk Backend API
			try {
				// Search for users with the given email address
				const users = await clerkClient.users.getUserList({
					emailAddress: [validated.recipientEmail],
					limit: 1,
				})

				if (users.length === 0) {
					return json(
						{ error: `No user found with email address: ${validated.recipientEmail}` },
						{ status: 404 },
					)
				}

				// Get the first matching user
				const user = users[0]

				// Verify the email is verified (optional but recommended)
				const emailAddress = user.emailAddresses.find(
					(email) => email.emailAddress === validated.recipientEmail,
				)

				if (!emailAddress) {
					return json(
						{ error: `Email address ${validated.recipientEmail} not found for user` },
						{ status: 404 },
					)
				}

				recipientUserId = user.id
			} catch (error) {
				console.error('Error looking up user by email:', error)
				return json(
					{ error: 'Failed to lookup user by email' },
					{ status: 500 },
				)
			}

			// Prevent self-connections
			if (requesterUserId === recipientUserId) {
				return json({ error: 'Cannot send connection request to yourself' }, { status: 400 })
			}

			// Check if connection already exists (in any direction)
			const existingConnection = await db
				.select()
				.from(userConnectionsTable)
				.where(
					or(
						and(
							eq(userConnectionsTable.requesterUserId, requesterUserId),
							eq(userConnectionsTable.recipientUserId, recipientUserId),
						),
						and(
							eq(userConnectionsTable.requesterUserId, recipientUserId),
							eq(userConnectionsTable.recipientUserId, requesterUserId),
						),
					),
				)
				.limit(1)

			if (existingConnection.length > 0) {
				const connection = existingConnection[0]
				if (connection.status === 'pending') {
					return json({ error: 'Connection request already pending' }, { status: 409 })
				}
				if (connection.status === 'accepted') {
					return json({ error: 'Users are already connected' }, { status: 409 })
				}
				if (connection.status === 'blocked') {
					return json({ error: 'Cannot send connection request' }, { status: 403 })
				}
				// If rejected, allow creating a new request
			}

			// Create new connection request
			const [newConnection] = await db
				.insert(userConnectionsTable)
				.values({
					requesterUserId,
					recipientUserId,
					status: 'pending',
				})
				.returning()

			return json(newConnection)
		} catch (error) {
			if (error instanceof z.ZodError) {
				return json({ error: 'Invalid request body' }, { status: 400 })
			}
			console.error('Error sending connection request:', error)
			return json({ error: 'Internal server error' }, { status: 500 })
		}
	},
})
