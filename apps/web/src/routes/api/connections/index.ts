import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq, or } from 'drizzle-orm'
import { createClerkClient } from '@clerk/backend'
import z from 'zod'
import db, { userConnectionsTable } from '@money-saver/db'
import { connectionRequestSchema } from '@/lib/validation'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

export const Route = createFileRoute('/api/connections/')({
	server: {
		handlers: {
			GET: async () => {
				try {
					const { userId } = await auth()
					if (!userId) {
						return Response.json({ error: 'Unauthorized' }, { status: 401 })
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

					return Response.json(connections)
				} catch (error) {
					console.error('Error fetching connections:', error)
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
							return Response.json(
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
							return Response.json(
								{ error: `Email address ${validated.recipientEmail} not found for user` },
								{ status: 404 },
							)
						}

						recipientUserId = user.id
					} catch (error) {
						console.error('Error looking up user by email:', error)
						return Response.json(
							{ error: 'Failed to lookup user by email' },
							{ status: 500 },
						)
					}

					// Prevent self-connections
					if (requesterUserId === recipientUserId) {
						return Response.json({ error: 'Cannot send connection request to yourself' }, { status: 400 })
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
							return Response.json({ error: 'Connection request already pending' }, { status: 409 })
						}
						if (connection.status === 'accepted') {
							return Response.json({ error: 'Users are already connected' }, { status: 409 })
						}
						if (connection.status === 'blocked') {
							return Response.json({ error: 'Cannot send connection request' }, { status: 403 })
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

					return Response.json(newConnection)
				} catch (error) {
					if (error instanceof z.ZodError) {
						return Response.json({ error: 'Invalid request body' }, { status: 400 })
					}
					console.error('Error sending connection request:', error)
					return Response.json({ error: 'Internal server error' }, { status: 500 })
				}
			},
		},
	},
})
