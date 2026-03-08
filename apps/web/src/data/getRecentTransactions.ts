import { createServerFn } from "@tanstack/react-start";
import { desc, eq, inArray } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import db from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { canViewUserTransactions } from "@/lib/connection-helpers";

const schema = z.object({
	userIds: z.array(z.string()).optional(),
});

export const getRecentTransactions = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		const viewerUserId = context.userId;
		let targetUserIds: string[];

		// Determine which users' transactions to fetch
		if (data.userIds && data.userIds.length > 0) {
			// Verify permission to view each user's transactions
			for (const userId of data.userIds) {
				// Allow viewing own transactions
				if (userId === viewerUserId) {
					continue;
				}
				// Verify permission for connected users
				const hasPermission = await canViewUserTransactions(
					viewerUserId,
					userId,
				);
				if (!hasPermission) {
					throw new Error(
						`Not authorized to view transactions for user: ${userId}`,
					);
				}
			}
			targetUserIds = data.userIds;
		} else {
			// Default: only own transactions
			targetUserIds = [viewerUserId];
		}

		const transactions = await db
			.select({
				id: transactionsTable.id,
				userId: transactionsTable.userId,
				description: transactionsTable.description,
				amount: transactionsTable.amount,
				transactionDate: transactionsTable.transactionDate,
				category: categoriesTable.name,
				transactionType: categoriesTable.type,
				recurringTransactionId: transactionsTable.recurringTransactionId,
			})
			.from(transactionsTable)
			.leftJoin(
				categoriesTable,
				eq(transactionsTable.categoryId, categoriesTable.id),
			)
			.where(inArray(transactionsTable.userId, targetUserIds))
			.orderBy(desc(transactionsTable.transactionDate))
			.limit(5);
		return transactions;
	});
