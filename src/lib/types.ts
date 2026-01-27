import { categoriesTable } from "@/db/schema";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  description: string;
  amount: string;
  category: string | null;
  transactionType: TransactionType | null;
  transactionDate: string;
};

export type Category = typeof categoriesTable.$inferSelect;

export type MonthlyCashflow = {
  month: number;
  income: number;
  expense: number;
};
