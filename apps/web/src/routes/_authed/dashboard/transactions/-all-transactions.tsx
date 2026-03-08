import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { MonthYearSelector } from "@/components/month-year-selector";
import { TransactionTable } from "@/components/transaction-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilter } from "@/components/user-filter";
import { formatMonthYear } from "@/lib/formatters";
import type { Transaction } from "@/lib/types";

export function AllTransactions({
	month,
	year,
	transactions,
	userIds,
}: {
	month: number;
	year: number;
	transactions: Transaction[];
	userIds?: string[];
}) {
	const navigate = useNavigate();
	const [selectedYear, setSelectedYear] = useState(year);
	const [selectedMonth, setSelectedMonth] = useState(month);
	const [selectedUserIds, setSelectedUserIds] = useState<string[] | undefined>(
		userIds,
	);

	const handleApplyFilters = () => {
		navigate({
			to: "/dashboard/transactions",
			search: {
				month: selectedMonth,
				year: selectedYear,
				userIds: selectedUserIds,
			},
		});
	};

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
						<Button onClick={handleApplyFilters}>Go</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex gap-4 items-end">
						<div className="flex-1">
							<UserFilter value={selectedUserIds} onChange={setSelectedUserIds} />
						</div>
					</div>
					<Button asChild>
						<Link to="/dashboard/transactions/new">New Transaction</Link>
					</Button>
					{!transactions.length ? (
						<EmptyState message="No transactions for this month" />
					) : (
						<TransactionTable transactions={transactions} showEditButton />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
