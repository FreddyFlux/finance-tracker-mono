import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { TransactionTable } from "@/components/transaction-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";

export function RecentTransactions({
	transactions,
}: {
	transactions: Transaction[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex justify-between">
					<span>Recent Transactions</span>
					<div className="flex gap-1">
						<Button asChild variant="outline">
							<Link to="/dashboard/transactions">View All</Link>
						</Button>
						<Button asChild>
							<Link to="/dashboard/transactions/new">New Transaction</Link>
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{!transactions.length ? (
					<EmptyState message="No transactions for this month" />
				) : (
					<TransactionTable transactions={transactions} />
				)}
			</CardContent>
		</Card>
	);
}
