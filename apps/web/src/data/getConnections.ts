import { createServerFn } from "@tanstack/react-start";
import { and, eq, or } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import { createClerkClient } from "@clerk/backend";
import db from "@/db";
import { userConnectionsTable } from "@/db/schema";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function getUserEmail(userId: string): Promise<string> {
	try {
		const user = await clerkClient.users.getUser(userId);
		const primaryEmail = user.emailAddresses.find(
			(email) => email.id === user.primaryEmailAddressId,
		);
		return (
			primaryEmail?.emailAddress ||
			user.emailAddresses[0]?.emailAddress ||
			userId
		);
	} catch (error) {
		console.error(`Failed to fetch email for user ${userId}:`, error);
		return userId; // Fallback to user ID if email lookup fails
	}
}

export const getConnections = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const userId = context.userId;

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
					eq(userConnectionsTable.status, "accepted"),
				),
			)
			.orderBy(userConnectionsTable.updatedAt);

		// Extract other user IDs and fetch their emails
		const otherUserIds = connections.map((conn) =>
			conn.requesterUserId === userId
				? conn.recipientUserId
				: conn.requesterUserId,
		);

		const emailMap = new Map<string, string>();
		await Promise.all(
			otherUserIds.map(async (id) => {
				const email = await getUserEmail(id);
				emailMap.set(id, email);
			}),
		);

		// Get current user's email
		const currentUserEmail = await getUserEmail(userId);

		// Return connections with the other user's ID and email, plus current user info
		return {
			currentUserId: userId,
			currentUserEmail,
			connections: connections.map((conn) => {
				const otherUserId =
					conn.requesterUserId === userId
						? conn.recipientUserId
						: conn.requesterUserId;
				return {
					id: conn.id,
					otherUserId,
					otherUserEmail: emailMap.get(otherUserId) || otherUserId,
					createdAt: conn.createdAt,
					updatedAt: conn.updatedAt,
				};
			}),
		};
	});
