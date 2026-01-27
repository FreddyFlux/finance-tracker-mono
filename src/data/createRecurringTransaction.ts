import db from "@/db";
import { recurringTransactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import { recurringTransactionSchema } from "@/lib/validation";
import { generateRecurringTransactionsForYear } from "./generateRecurringTransactions";
import { getCurrentYear } from "@/lib/validation";

export const createRecurringTransaction = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof recurringTransactionSchema>) => {
		return recurringTransactionSchema.parse(data);
	})
	.handler(async ({ data, context }) => {
		const userId = context.userId;

		// Create the recurring transaction template
		const recurringTransaction = await db
			.insert(recurringTransactionsTable)
			.values({
				userId,
				description: data.description,
				amount: data.amount.toString(),
				categoryId: data.categoryId,
				transactionType: data.transactionType,
				repeatFrequency: data.repeatFrequency,
				startDate: data.startDate,
				endDate: data.endDate ?? null,
				isActive: true,
			})
			.returning();

		// Generate transactions for the current year
		const startYear = new Date(data.startDate).getFullYear();
		const currentYear = getCurrentYear();
		const yearToGenerate = Math.max(startYear, currentYear);

		await generateRecurringTransactionsForYear({
			userId,
			year: yearToGenerate,
		});

		return recurringTransaction[0];
	});
