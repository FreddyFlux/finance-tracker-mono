import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import type z from "zod";
import db, { userConnectionsTable } from "@money-saver/db";
import { connectionResponseSchema } from "@/lib/validation";

const schema = connectionResponseSchema;

export const respondToConnectionRequest = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		const userId = context.userId;
		const { connectionId, action } = data;

		// Verify the connection request exists and user is the recipient
		const [connection] = await db
			.select()
			.from(userConnectionsTable)
			.where(
				and(
					eq(userConnectionsTable.id, connectionId),
					eq(userConnectionsTable.recipientUserId, userId),
					eq(userConnectionsTable.status, "pending"),
				),
			)
			.limit(1);

		if (!connection) {
			throw new Error("Connection request not found or already processed");
		}

		// Update connection status
		const newStatus = action === "accept" ? "accepted" : "rejected";
		const [updatedConnection] = await db
			.update(userConnectionsTable)
			.set({
				status: newStatus,
				updatedAt: new Date(),
			})
			.where(eq(userConnectionsTable.id, connectionId))
			.returning();

		return updatedConnection;
	});
