import z from "zod";
import { addDays } from "date-fns";
import { TRANSACTION_LIMITS } from "./constants";

const today = new Date();

/**
 * Common validation schemas for reuse across the application
 */
export const yearSchema = z
  .number()
  .min(today.getFullYear() - TRANSACTION_LIMITS.YEAR_RANGE_OFFSET)
  .max(today.getFullYear())
  .catch(today.getFullYear())
  .optional();

export const monthSchema = z
  .number()
  .min(1)
  .max(12)
  .catch(today.getMonth() + 1)
  .optional();

export const transactionDateSchema = z
  .date()
  .max(addDays(new Date(), 1), "Transaction date cannot be in the future");

export const transactionDateStringSchema = z.string().refine(
  (value) => {
    const parsedDate = new Date(value);
    return (
      !isNaN(parsedDate.getTime()) && parsedDate <= addDays(new Date(), 1)
    );
  },
  { message: "Invalid date" }
);

export const amountSchema = z.coerce
  .number()
  .positive("Amount must be greater than 0");

export const descriptionSchema = z
  .string()
  .min(
    TRANSACTION_LIMITS.DESCRIPTION_MIN_LENGTH,
    `Description must be at least ${TRANSACTION_LIMITS.DESCRIPTION_MIN_LENGTH} characters`
  )
  .max(
    TRANSACTION_LIMITS.DESCRIPTION_MAX_LENGTH,
    `Description must be less than ${TRANSACTION_LIMITS.DESCRIPTION_MAX_LENGTH} characters`
  );

export const categoryIdSchema = z.coerce
  .number()
  .positive("Please select a category");

export const transactionIdSchema = z.number();

export const repeatFrequencySchema = z.enum(["monthly", "yearly"]);

export const recurringTransactionIdSchema = z.number().positive();

export const recurringTransactionSchema = z.object({
  description: descriptionSchema,
  amount: amountSchema,
  categoryId: categoryIdSchema,
  transactionType: z.enum(["income", "expense"]),
  repeatFrequency: repeatFrequencySchema,
  startDate: transactionDateStringSchema,
  endDate: transactionDateStringSchema.optional().nullable(),
});

/**
 * Search schema for dashboard with cashflow year filter
 */
export const dashboardSearchSchema = z.object({
  cfyear: yearSchema,
});

/**
 * Search schema for transactions with month and year filters
 */
export const transactionsSearchSchema = z.object({
  month: monthSchema,
  year: yearSchema,
});

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return today.getFullYear();
}

/**
 * Get current month (1-12)
 */
export function getCurrentMonth(): number {
  return today.getMonth() + 1;
}
