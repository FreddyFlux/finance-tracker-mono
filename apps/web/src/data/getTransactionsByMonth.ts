import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import db from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { canViewUserTransactions } from "@/lib/connection-helpers";
import { TRANSACTION_LIMITS } from "@/lib/constants";
import { getCurrentYear } from "@/lib/validation";
import { generateRecurringTransactionsForMonth } from "./generateRecurringTransactions";

const schema = z.object({
	month: z.number().min(1).max(12),
	year: z
		.number()
		.min(getCurrentYear() - TRANSACTION_LIMITS.YEAR_RANGE_OFFSET)
		.max(getCurrentYear()),
	// Optional: array of user IDs to filter by (must be connected or self)
	userIds: z.array(z.string()).optional(),
});

export const getTransactionsByMonth = createServerFn({
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

		// Generate recurring transactions for each user
		for (const userId of targetUserIds) {
			await generateRecurringTransactionsForMonth({
				userId,
				month: data.month,
				year: data.year,
			});
		}

		const earliestDate = new Date(data.year, data.month - 1, 1);
		const latestDate = new Date(data.year, data.month, 0);

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
			.where(
				and(
					inArray(transactionsTable.userId, targetUserIds),
					gte(
						transactionsTable.transactionDate,
						format(earliestDate, "yyyy-MM-dd"),
					),
					lte(
						transactionsTable.transactionDate,
						format(latestDate, "yyyy-MM-dd"),
					),
				),
			)
			.orderBy(desc(transactionsTable.transactionDate));
		return transactions;
	});
