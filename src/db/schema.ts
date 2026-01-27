import { boolean, date, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  type: text({
    enum: ["income", "expense"],
  }).notNull(),
});

export const recurringTransactionsTable = pgTable("recurring_transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  description: text().notNull(),
  amount: numeric().notNull(),
  categoryId: integer("category_id")
    .references(() => categoriesTable.id)
    .notNull(),
  transactionType: text("transaction_type", {
    enum: ["income", "expense"],
  }).notNull(),
  repeatFrequency: text("repeat_frequency", {
    enum: ["monthly", "yearly"],
  }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionsTable = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  description: text("description").notNull(),
  amount: numeric().notNull(),
  transactionDate: date("transaction_date").notNull(),
  categoryId: integer("category_id")
    .references(() => categoriesTable.id)
    .notNull(),
  recurringTransactionId: integer("recurring_transaction_id").references(
    () => recurringTransactionsTable.id
  ),
});
