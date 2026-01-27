import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import {
  transactionDateStringSchema,
  amountSchema,
  descriptionSchema,
  categoryIdSchema,
} from "@/lib/validation";
import { sanitizeDescription } from "@/lib/sanitize";

const transactionSchema = z.object({
  transactionType: z.enum(["income", "expense"]),
  categoryId: categoryIdSchema,
  transactionDate: transactionDateStringSchema,
  amount: amountSchema,
  description: descriptionSchema.transform(sanitizeDescription),
});

export const createTransaction = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof transactionSchema>) => {
    return transactionSchema.parse(data);
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const transaction = await db
      .insert(transactionsTable)
      .values({
        userId,
        amount: data.amount.toString(),
        description: data.description,
        transactionDate: data.transactionDate,
        categoryId: data.categoryId,
      })
      .returning();
    return transaction;
  });
