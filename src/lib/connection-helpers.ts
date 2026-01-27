import { and, eq, or } from "drizzle-orm";
import db from "@/db";
import { userConnectionsTable } from "@/db/schema";

/**
 * Verify if a user has permission to view another user's transactions
 * Users can only view transactions of users they're connected to (status = 'accepted')
 */
export async function canViewUserTransactions(
	viewerUserId: string,
	targetUserId: string,
): Promise<boolean> {
	// Users can always view their own transactions
	if (viewerUserId === targetUserId) {
		return true;
	}

	// Check if there's an accepted connection
	const [connection] = await db
		.select()
		.from(userConnectionsTable)
		.where(
			and(
				or(
					and(
						eq(userConnectionsTable.requesterUserId, viewerUserId),
						eq(userConnectionsTable.recipientUserId, targetUserId),
					),
					and(
						eq(userConnectionsTable.requesterUserId, targetUserId),
						eq(userConnectionsTable.recipientUserId, viewerUserId),
					),
				),
				eq(userConnectionsTable.status, "accepted"),
			),
		)
		.limit(1);

	return !!connection;
}

/**
 * Get all user IDs that the current user can view transactions for
 * Returns array of user IDs including the current user
 */
export async function getViewableUserIds(userId: string): Promise<string[]> {
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
		);

	// Extract the other user IDs
	const otherUserIds = connections.map((conn) =>
		conn.requesterUserId === userId
			? conn.recipientUserId
			: conn.requesterUserId,
	);

	// Return current user ID plus all connected user IDs
	return [userId, ...otherUserIds];
}
