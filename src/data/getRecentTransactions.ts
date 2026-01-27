import db from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import authMiddleware from "middlewares/authMiddleware";

export const getRecentTransactions = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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
      .where(eq(transactionsTable.userId, context.userId))
      .orderBy(desc(transactionsTable.transactionDate))
      .limit(5);
    return transactions;
  });
