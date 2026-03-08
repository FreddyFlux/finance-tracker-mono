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

export const getTransaction = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ data, context }) => {
		const [transaction] = await db
			.select()
			.from(transactionsTable)
			.where(
				and(
					eq(transactionsTable.id, data.transactionId),
					eq(transactionsTable.userId, context.userId),
				),
			);
		return transaction;
	});
