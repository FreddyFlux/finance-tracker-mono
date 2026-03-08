import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import db from "@/db";
import { transactionsTable } from "@/db/schema";

export const getTransactionYearsRange = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const today = new Date();
		const transactions = await db
			.select({
				transactionDate: transactionsTable.transactionDate,
			})
			.from(transactionsTable)
			.where(eq(transactionsTable.userId, context.userId))
			.orderBy(asc(transactionsTable.transactionDate))
			.limit(1);

		const currentYear = today.getFullYear();
		const earliestYear = transactions[0]
			? new Date(transactions[0].transactionDate).getFullYear()
			: currentYear;

		const yearsRange = Array.from({
			length: currentYear - earliestYear + 1,
		}).map((_, index) => {
			return currentYear - index;
		});
		return yearsRange;
	});
