import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { addDays } from "date-fns";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";

const transactionSchema = z.object({
  transactionType: z.enum(["income", "expense"]),
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
