import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import {
  transactionDateStringSchema,
  amountSchema,
  descriptionSchema,
  categoryIdSchema,
  transactionIdSchema,
} from "@/lib/validation";
import { sanitizeDescription } from "@/lib/sanitize";

const schema = z.object({
  id: transactionIdSchema,
  categoryId: categoryIdSchema,
  transactionDate: transactionDateStringSchema,
  amount: amountSchema,
  description: descriptionSchema.transform(sanitizeDescription),
});

export const updateTransaction = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
  .handler(async ({ context, data }) => {
    await db
      .update(transactionsTable)
      .set({
        amount: data.amount.toString(),
        categoryId: data.categoryId,
        transactionDate: data.transactionDate,
        description: data.description,
      })
      .where(
        and(
          eq(transactionsTable.id, data.id),
          eq(transactionsTable.userId, context.userId)
        )
      );
  });
