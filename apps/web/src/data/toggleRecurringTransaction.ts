import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import db, { recurringTransactionsTable } from "@money-saver/db";
import { recurringTransactionIdSchema } from "@/lib/validation";

const schema = z.object({
	id: recurringTransactionIdSchema,
	isActive: z.boolean(),
});

export const toggleRecurringTransaction = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		await db
			.update(recurringTransactionsTable)
			.set({
				isActive: data.isActive,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(recurringTransactionsTable.id, data.id),
					eq(recurringTransactionsTable.userId, context.userId),
				),
			);
	});
