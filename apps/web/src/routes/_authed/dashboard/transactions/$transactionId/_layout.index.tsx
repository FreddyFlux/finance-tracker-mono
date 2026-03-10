import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import {
	TransactionForm,
	type transactionFormSchema,
} from "@/components/transaction-form";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/app-context";
import { deleteTransaction } from "@/data/deleteTransaction";
import { getTransaction } from "@/data/getTransaction";
import { updateTransaction } from "@/data/updateTransaction";
import {
	formatApiDate,
	formatCurrency,
	formatDisplayDate,
} from "@/lib/formatters";
import { showSuccessToast } from "@/lib/toast";

export const Route = createFileRoute(
	"/_authed/dashboard/transactions/$transactionId/_layout/",
)({
	component: RouteComponent,
	errorComponent: ({ error }) => {
		return (
			<div className="flex text-4xl text-muted-foreground items-center justify-center h-full py-20">
				{error.message}
			</div>
		);
	},
	loader: async ({ params }) => {
		const result = await getTransaction({
			data: {
				transactionId: Number(params.transactionId),
			},
		});
		if (!result) {
			throw new Error("Transaction not found");
		}
		return { transaction: result.transaction, canEdit: result.canEdit };
	},
});

function RouteComponent() {
	const [isDeleting, setIsDeleting] = useState(false);
	const { transaction, canEdit } = Route.useLoaderData();
	const { categories } = useAppContext();
	const navigate = useNavigate();

	const categoryName =
		categories.find((c) => c.id === transaction.categoryId)?.name ?? "—";

	const handleSubmit = async (data: z.infer<typeof transactionFormSchema>) => {
		await updateTransaction({
			data: {
				id: transaction.id,
				amount: data.amount,
				transactionDate: formatApiDate(data.transactionDate),
				categoryId: data.categoryId,
				description: data.description,
			},
		});

		showSuccessToast("Success!", "Transaction updated successfully");
		navigate({
			to: "/dashboard/transactions",
			search: {
				month: data.transactionDate.getMonth() + 1,
				year: data.transactionDate.getFullYear(),
			},
		});
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		await deleteTransaction({
			data: {
				transactionId: Number(transaction.id),
			},
		});
		showSuccessToast("Success!", "Transaction deleted successfully");
		setIsDeleting(false);

		const date = new Date(transaction.transactionDate);
		navigate({
			to: "/dashboard/transactions",
			search: {
				month: date.getMonth() + 1,
				year: date.getFullYear(),
			},
		});
	};

	return (
		<Card className="max-w-3xl mt-4">
			<CardHeader>
				<CardTitle className="flex justify-between">
					<span>{canEdit ? "Edit Transaction" : "View Transaction"}</span>
					{canEdit && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="icon">
									<Trash2Icon />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This transaction will be
										permanently deleted.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<Button
										disabled={isDeleting}
										variant="destructive"
										onClick={handleDeleteConfirm}
									>
										{isDeleting ? "Deleting..." : "Delete"}
									</Button>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{canEdit ? (
					<TransactionForm
						defaultValues={{
							amount: Number(transaction.amount),
							categoryId: transaction.categoryId,
							description: transaction.description,
							transactionDate: new Date(transaction.transactionDate),
							transactionType:
								categories.find(
									(category) => category.id === transaction.categoryId,
								)?.type ?? "income",
						}}
						onSubmit={handleSubmit}
					/>
				) : (
					<dl className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<dt className="font-medium text-muted-foreground">Date</dt>
							<dd>
								{formatDisplayDate(new Date(transaction.transactionDate))}
							</dd>
						</div>
						<div>
							<dt className="font-medium text-muted-foreground">Category</dt>
							<dd>{categoryName}</dd>
						</div>
						<div>
							<dt className="font-medium text-muted-foreground">Amount</dt>
							<dd>{formatCurrency(Number(transaction.amount), true)}</dd>
						</div>
						<div className="col-span-2">
							<dt className="font-medium text-muted-foreground">Description</dt>
							<dd>{transaction.description}</dd>
						</div>
					</dl>
				)}
			</CardContent>
		</Card>
	);
}
