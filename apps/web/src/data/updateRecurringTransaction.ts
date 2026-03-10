import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import type z from "zod";
import db, { recurringTransactionsTable } from "@money-saver/db";
import {
	getCurrentYear,
	recurringTransactionIdSchema,
	recurringTransactionSchema,
} from "@/lib/validation";
import { generateRecurringTransactionsForYear } from "./generateRecurringTransactions";

const schema = recurringTransactionSchema.extend({
	id: recurringTransactionIdSchema,
});

export const updateRecurringTransaction = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		// Update the recurring transaction template
		await db
			.update(recurringTransactionsTable)
			.set({
				description: data.description,
				amount: data.amount.toString(),
				categoryId: data.categoryId,
				transactionType: data.transactionType,
				repeatFrequency: data.repeatFrequency,
				startDate: data.startDate,
				endDate: data.endDate ?? null,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(recurringTransactionsTable.id, data.id),
					eq(recurringTransactionsTable.userId, context.userId),
				),
			);

		// Regenerate transactions for the current year and start year
		const startYear = new Date(data.startDate).getFullYear();
		const currentYear = getCurrentYear();
		const yearsToGenerate = [
			Math.max(startYear, currentYear),
			startYear !== currentYear ? startYear : currentYear,
		];

		for (const year of yearsToGenerate) {
			await generateRecurringTransactionsForYear({
				userId: context.userId,
				year,
			});
		}
	});
