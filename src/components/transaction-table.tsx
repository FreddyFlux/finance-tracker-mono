import { Link, useRouter } from "@tanstack/react-router";
import { PencilIcon, RepeatIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getUserEmails } from "@/data/getUserEmails";
import { TRANSACTION_TYPE_COLORS } from "@/lib/constants";
import { formatCurrency, formatDisplayDate } from "@/lib/formatters";
import type { Transaction, TransactionType } from "@/lib/types";

interface TransactionTableProps {
	transactions: Transaction[];
	showEditButton?: boolean;
}

export function TransactionTable({
	transactions,
	showEditButton = false,
}: TransactionTableProps) {
	const router = useRouter();
	const [emailMap, setEmailMap] = useState<Record<string, string>>({});

	useEffect(() => {
		async function loadEmails() {
			const uniqueUserIds = Array.from(
				new Set(transactions.map((t) => t.userId)),
			);
			if (uniqueUserIds.length > 0) {
				try {
					const emails = await getUserEmails({
						data: { userIds: uniqueUserIds },
					});
					setEmailMap(emails);
				} catch (error) {
					console.error("Failed to load user emails:", error);
				}
			}
		}
		loadEmails();
	}, [transactions]);

	return (
		<Table className="mt-4">
			<TableHeader>
				<TableRow>
					<TableHead>Date</TableHead>
					<TableHead>User</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Amount</TableHead>
					{showEditButton && (
						<TableHead className="text-right">Actions</TableHead>
					)}
				</TableRow>
			</TableHeader>
			<TableBody>
				{transactions.map((transaction) => (
					<TableRow key={transaction.id}>
						<TableCell>
							{formatDisplayDate(transaction.transactionDate)}
						</TableCell>
						<TableCell>
							{emailMap[transaction.userId] || transaction.userId}
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-2">
								{transaction.description}
								{transaction.recurringTransactionId && (
									<Badge variant="outline" className="text-xs">
										<RepeatIcon className="h-3 w-3 mr-1" />
										Recurring
									</Badge>
								)}
							</div>
						</TableCell>
						<TableCell className="capitalize">
							<TransactionTypeBadge
								transactionType={transaction.transactionType}
							/>
						</TableCell>
						<TableCell>{transaction.category}</TableCell>
						<TableCell>{formatCurrency(transaction.amount, true)}</TableCell>
						{showEditButton && (
							<TableCell className="text-right">
								<Button
									variant="outline"
									size="icon"
									aria-label="Edit Transaction"
									asChild
								>
									<Link
										onClick={() => {
											router.clearCache({
												filter: (route) =>
													route.pathname !==
													`/dashboard/transactions/${transaction.id}`,
											});
										}}
										to="/dashboard/transactions/$transactionId"
										params={{ transactionId: transaction.id.toString() }}
									>
										<PencilIcon />
									</Link>
								</Button>
							</TableCell>
						)}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

interface TransactionTypeBadgeProps {
	transactionType: TransactionType | null;
}

function TransactionTypeBadge({ transactionType }: TransactionTypeBadgeProps) {
	if (!transactionType) return null;

	return (
		<Badge className={TRANSACTION_TYPE_COLORS[transactionType]}>
			{transactionType}
		</Badge>
	);
}
