import { createServerFn } from "@tanstack/react-start";
import { eq, or } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import { clerkClient } from "@clerk/clerk-sdk-node";
import db from "@/db";
import { userConnectionsTable } from "@/db/schema";

async function getUserEmail(userId: string): Promise<string> {
	try {
		const user = await clerkClient.users.getUser(userId);
		const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
		return primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress || userId;
	} catch (error) {
		console.error(`Failed to fetch email for user ${userId}:`, error);
		return userId; // Fallback to user ID if email lookup fails
	}
}

export const getConnectionRequests = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const userId = context.userId;

		// Get all connection requests where user is requester or recipient
		const connections = await db
			.select()
			.from(userConnectionsTable)
			.where(
				or(
					eq(userConnectionsTable.requesterUserId, userId),
					eq(userConnectionsTable.recipientUserId, userId),
				),
			)
			.orderBy(userConnectionsTable.createdAt);

		// Separate into sent and received requests
		const sentRequests = connections.filter(
			(conn) => conn.requesterUserId === userId && conn.status === "pending",
		);
		const receivedRequests = connections.filter(
			(conn) => conn.recipientUserId === userId && conn.status === "pending",
		);
		const acceptedConnections = connections.filter(
			(conn) => conn.status === "accepted",
		);

		// Fetch emails for all unique user IDs
		const userIds = new Set<string>();
		sentRequests.forEach((conn) => userIds.add(conn.recipientUserId));
		receivedRequests.forEach((conn) => userIds.add(conn.requesterUserId));
		acceptedConnections.forEach((conn) => {
			userIds.add(conn.requesterUserId);
			userIds.add(conn.recipientUserId);
		});

		const emailMap = new Map<string, string>();
		await Promise.all(
			Array.from(userIds).map(async (id) => {
				const email = await getUserEmail(id);
				emailMap.set(id, email);
			}),
		);

		// Add email addresses to the results
		const sentRequestsWithEmail = sentRequests.map((req) => ({
			...req,
			recipientEmail: emailMap.get(req.recipientUserId) || req.recipientUserId,
		}));

		const receivedRequestsWithEmail = receivedRequests.map((req) => ({
			...req,
			requesterEmail: emailMap.get(req.requesterUserId) || req.requesterUserId,
		}));

		const acceptedConnectionsWithEmail = acceptedConnections.map((conn) => ({
			...conn,
			requesterEmail: emailMap.get(conn.requesterUserId) || conn.requesterUserId,
			recipientEmail: emailMap.get(conn.recipientUserId) || conn.recipientUserId,
		}));

		return {
			sentRequests: sentRequestsWithEmail,
			receivedRequests: receivedRequestsWithEmail,
			acceptedConnections: acceptedConnectionsWithEmail,
			all: connections,
		};
	});
