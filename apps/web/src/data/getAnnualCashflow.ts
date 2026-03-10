import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, sql } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import db, { categoriesTable, transactionsTable } from "@money-saver/db";
import { canViewUserTransactions } from "@/lib/connection-helpers";
import { generateRecurringTransactionsForYear } from "./generateRecurringTransactions";

const schema = z.object({
	year: z.number(),
	userIds: z.array(z.string()).optional(),
});

export const getAnnualCashflow = createServerFn({
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
			await generateRecurringTransactionsForYear({
				userId,
				year: data.year,
			});
		}

		const cashflow = await db
			.select({
				month: sql<string>`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`,
				totalIncome: sql<string>`SUM(CASE WHEN ${categoriesTable.type} = 'income' THEN ${transactionsTable.amount} ELSE 0 END)`,
				totalExpenses: sql<string>`SUM(CASE WHEN ${categoriesTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END)`,
			})
			.from(transactionsTable)
			.leftJoin(
				categoriesTable,
				eq(transactionsTable.categoryId, categoriesTable.id),
			)
			.where(
				and(
					inArray(transactionsTable.userId, targetUserIds),
					sql`EXTRACT(YEAR FROM ${transactionsTable.transactionDate}) = ${data.year}`,
				),
			)
			.groupBy(sql`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`)
			.orderBy(sql`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`);

		const annualCashflow: {
			month: number;
			income: number;
			expense: number;
		}[] = [];

		for (let i = 1; i <= 12; i++) {
			const monthlyCashflow = cashflow.find((cf) => Number(cf.month) === i);
			annualCashflow.push({
				month: i,
				income: Number(monthlyCashflow?.totalIncome ?? 0),
				expense: Number(monthlyCashflow?.totalExpenses ?? 0),
			});
		}
		return annualCashflow;
	});
