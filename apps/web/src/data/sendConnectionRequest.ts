import { createServerFn } from "@tanstack/react-start";
import { and, eq, or } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";
import db from "@/db";
import { userConnectionsTable } from "@/db/schema";

const schema = z.object({
	recipientEmail: z.string().email("Please enter a valid email address"),
});

export const sendConnectionRequest = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		const requesterUserId = context.userId;
		let recipientUserId: string;

		// Look up user by email using Clerk Backend API
		try {
			// Search for users with the given email address
			const users = await clerkClient.users.getUserList({
				emailAddress: [data.recipientEmail],
				limit: 1,
			});

			if (users.length === 0) {
				throw new Error(
					`No user found with email address: ${data.recipientEmail}`,
				);
			}

			// Get the first matching user
			const user = users[0];

			// Verify the email is verified (optional but recommended)
			const emailAddress = user.emailAddresses.find(
				(email) => email.emailAddress === data.recipientEmail,
			);

			if (!emailAddress) {
				throw new Error(
					`Email address ${data.recipientEmail} not found for user`,
				);
			}

			recipientUserId = user.id;
		} catch (error) {
			// Re-throw if it's already our custom error
			if (error instanceof Error && error.message.includes("No user found")) {
				throw error;
			}
			// Handle Clerk API errors
			if (error instanceof Error) {
				throw new Error(
					`Failed to lookup user by email: ${error.message}`,
				);
			}
			throw new Error("Failed to lookup user by email");
		}

		// Prevent self-connections
		if (requesterUserId === recipientUserId) {
			throw new Error("Cannot send connection request to yourself");
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
			.limit(1);

		if (existingConnection.length > 0) {
			const connection = existingConnection[0];
			if (connection.status === "pending") {
				throw new Error("Connection request already pending");
			}
			if (connection.status === "accepted") {
				throw new Error("Users are already connected");
			}
			if (connection.status === "blocked") {
				throw new Error("Cannot send connection request");
			}
			// If rejected, allow creating a new request
		}

		// Create new connection request
		const [newConnection] = await db
			.insert(userConnectionsTable)
			.values({
				requesterUserId,
				recipientUserId,
				status: "pending",
			})
			.returning();

		return newConnection;
	});
