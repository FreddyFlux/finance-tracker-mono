import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable } from "@/components/transaction-table";
import { EmptyState } from "@/components/empty-state";
import { MonthYearSelector } from "@/components/month-year-selector";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatMonthYear } from "@/lib/formatters";
import { Transaction } from "@/lib/types";

export function AllTransactions({
  month,
  year,
  transactions,
}: {
  month: number;
  year: number;
  transactions: Transaction[];
}) {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Transactions for {formatMonthYear(month, year)}</span>
          <div className="flex gap-1">
            <MonthYearSelector
              year={selectedYear}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />
            <Button asChild>
              <Link
                to="/dashboard/transactions"
                search={{ month: selectedMonth, year: selectedYear }}
              >
                Go
              </Link>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/dashboard/transactions/new">New Transaction</Link>
        </Button>
        {!transactions.length ? (
          <EmptyState message="No transactions for this month" />
        ) : (
          <TransactionTable transactions={transactions} showEditButton />
        )}
      </CardContent>
    </Card>
  );
}
