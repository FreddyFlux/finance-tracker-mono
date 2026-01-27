import db from "@/db";
import { recurringTransactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import { recurringTransactionIdSchema } from "@/lib/validation";

const schema = z.object({
	id: recurringTransactionIdSchema,
});

export const deleteRecurringTransaction = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		// Delete the recurring transaction template
		// Note: Generated transactions remain in the database (historical data preserved)
		await db
			.delete(recurringTransactionsTable)
			.where(
				and(
					eq(recurringTransactionsTable.id, data.id),
					eq(recurringTransactionsTable.userId, context.userId),
				),
			);
	});
