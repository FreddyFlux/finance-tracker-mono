import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { addDays } from "date-fns";
import { and, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";

const schema = z.object({
  id: z.number(),
  categoryId: z.coerce.number().positive("Please select a category"),
  transactionDate: z.string().refine(
    (value) => {
      const parsedDate = new Date(value);
      return (
        !isNaN(parsedDate.getTime()) && parsedDate <= addDays(new Date(), 1)
      );
    },
    { message: "Invalid date" }
  ),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(300, "Description must be less than 300 characters"),
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
