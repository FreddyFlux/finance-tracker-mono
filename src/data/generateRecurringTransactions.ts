import { addMonths, addYears } from "date-fns";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import db from "@/db";
import { recurringTransactionsTable, transactionsTable } from "@/db/schema";
import { formatApiDate } from "@/lib/formatters";

/**
 * Calculate all occurrence dates for a recurring transaction within a given year
 */
function calculateOccurrences({
  startDate,
  endDate,
  frequency,
  year,
}: {
  startDate: string;
  endDate: string | null;
  frequency: "monthly" | "yearly";
  year: number;
}): string[] {
  const occurrences: string[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(`${year}-12-31`);
  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31`);
  const today = new Date();

  let current = new Date(start);

  // Advance to first occurrence in the target year
  if (frequency === "monthly") {
    // For monthly, advance month by month until we're in the target year
    while (current.getFullYear() < year && current <= end) {
      current = addMonths(current, 1);
    }
    // If we're before the year start, advance until we're in the year
    while (current < yearStart && current <= end) {
      current = addMonths(current, 1);
    }
  } else {
    // For yearly, advance year by year until we're in the target year
    while (current.getFullYear() < year && current <= end) {
      current = addYears(current, 1);
    }
  }

  // Generate occurrences within the year
  while (current <= yearEnd && current <= end) {
    // Only include dates up to today (no future transactions)
    if (current <= today) {
      occurrences.push(formatApiDate(current));
    }

    if (frequency === "monthly") {
      current = addMonths(current, 1);
    } else {
      current = addYears(current, 1);
    }
  }

  return occurrences;
}

/**
 * Generate recurring transactions for a specific year
 */
export async function generateRecurringTransactionsForYear({
  userId,
  year,
}: {
  userId: string;
  year: number;
}): Promise<void> {
  // Get all active recurring templates that could have occurrences in this year
  const activeTemplates = await db
    .select()
    .from(recurringTransactionsTable)
    .where(
      and(
        eq(recurringTransactionsTable.userId, userId),
        eq(recurringTransactionsTable.isActive, true),
        // Template must have started before or during this year
        lte(recurringTransactionsTable.startDate, `${year}-12-31`),
        // Template must not have ended before this year
        or(
          isNull(recurringTransactionsTable.endDate),
          gte(recurringTransactionsTable.endDate, `${year}-01-01`)
        )
      )
    );

  for (const template of activeTemplates) {
    // Calculate all occurrence dates for this year
    const occurrences = calculateOccurrences({
      startDate: template.startDate,
      endDate: template.endDate ?? null,
      frequency: template.repeatFrequency as "monthly" | "yearly",
      year,
    });

    for (const occurrenceDate of occurrences) {
      // Skip if transaction already exists
      const existing = await db
        .select()
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.userId, userId),
            eq(transactionsTable.recurringTransactionId, template.id),
            eq(transactionsTable.transactionDate, occurrenceDate)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Generate the transaction
        await db.insert(transactionsTable).values({
          userId,
          description: template.description,
          amount: template.amount,
          categoryId: template.categoryId,
          transactionDate: occurrenceDate,
          recurringTransactionId: template.id,
        });
      }
    }
  }
}

/**
 * Generate recurring transactions for a specific month
 */
export async function generateRecurringTransactionsForMonth({
  userId,
  month: _month,
  year,
}: {
  userId: string;
  month: number;
  year: number;
}): Promise<void> {
  // Generate for the entire year (more efficient than month-by-month)
  await generateRecurringTransactionsForYear({ userId, year });
}
