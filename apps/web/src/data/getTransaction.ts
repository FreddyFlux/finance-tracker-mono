import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import db, { transactionsTable } from "@money-saver/db";
import { canViewUserTransactions } from "@/lib/connection-helpers";
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
			.where(eq(transactionsTable.id, data.transactionId));

		if (!transaction) {
			return null;
		}

		const canView = await canViewUserTransactions(
			context.userId,
			transaction.userId,
		);
		if (!canView) {
			return null;
		}

		return {
			transaction,
			canEdit: transaction.userId === context.userId,
		};
	});
