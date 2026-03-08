import { createServerFn } from "@tanstack/react-start";
import { and, eq, or } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import type z from "zod";
import db from "@/db";
import { userConnectionsTable } from "@/db/schema";
import { removeConnectionSchema } from "@/lib/validation";

const schema = removeConnectionSchema;

export const removeConnection = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		const userId = context.userId;
		const { connectionId } = data;

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
					eq(userConnectionsTable.status, "accepted"),
				),
			)
			.limit(1);

		if (!connection) {
			throw new Error("Connection not found or not authorized");
		}

		// Delete the connection
		await db
			.delete(userConnectionsTable)
			.where(eq(userConnectionsTable.id, connectionId));

		return { success: true };
	});
