import db from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";
import z from "zod";
import { TRANSACTION_LIMITS } from "@/lib/constants";
import { getCurrentYear } from "@/lib/validation";
import { generateRecurringTransactionsForMonth } from "./generateRecurringTransactions";

const schema = z.object({
  month: z.number().min(1).max(12),
  year: z
    .number()
    .min(getCurrentYear() - TRANSACTION_LIMITS.YEAR_RANGE_OFFSET)
    .max(getCurrentYear()),
});

export const getTransactionsByMonth = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
  .handler(async ({ context, data }) => {
    // Generate recurring transactions for the requested month/year
    await generateRecurringTransactionsForMonth({
      userId: context.userId,
      month: data.month,
      year: data.year,
    });

    const earliestDate = new Date(data.year, data.month - 1, 1);
    const latestDate = new Date(data.year, data.month, 0);

    const transactions = await db
      .select({
        id: transactionsTable.id,
        description: transactionsTable.description,
        amount: transactionsTable.amount,
        transactionDate: transactionsTable.transactionDate,
        category: categoriesTable.name,
        transactionType: categoriesTable.type,
        recurringTransactionId: transactionsTable.recurringTransactionId,
      })
      .from(transactionsTable)
      .leftJoin(
        categoriesTable,
        eq(transactionsTable.categoryId, categoriesTable.id)
      )
      .where(
        and(
          eq(transactionsTable.userId, context.userId),
          gte(
            transactionsTable.transactionDate,
            format(earliestDate, "yyyy-MM-dd")
          ),
          lte(
            transactionsTable.transactionDate,
            format(latestDate, "yyyy-MM-dd")
          )
        )
      )
      .orderBy(desc(transactionsTable.transactionDate));
    return transactions;
  });
