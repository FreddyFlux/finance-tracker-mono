import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { transactionIdSchema } from "@/lib/validation";

const schema = z.object({
	transactionId: transactionIdSchema,
});

export const deleteTransaction = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ context, data }) => {
		await db
			.delete(transactionsTable)
			.where(
				and(
					eq(transactionsTable.id, data.transactionId),
					eq(transactionsTable.userId, context.userId),
				),
			);
	});
