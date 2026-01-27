import { categoriesTable, recurringTransactionsTable } from "@/db/schema";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  description: string;
  amount: string;
  category: string | null;
  transactionType: TransactionType | null;
  transactionDate: string;
  recurringTransactionId: number | null;
};

export type Category = typeof categoriesTable.$inferSelect;

export type RecurringTransaction = typeof recurringTransactionsTable.$inferSelect;

export type MonthlyCashflow = {
  month: number;
  income: number;
  expense: number;
};
