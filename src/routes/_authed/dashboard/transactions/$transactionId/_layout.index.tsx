import {
  TransactionForm,
  transactionFormSchema,
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
import { deleteTransaction } from "@/data/deleteTransaction";
import { getTransaction } from "@/data/getTransaction";
import { updateTransaction } from "@/data/updateTransaction";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatApiDate } from "@/lib/formatters";
import { showSuccessToast } from "@/lib/toast";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { useAppContext } from "@/contexts/app-context";

export const Route = createFileRoute(
  "/_authed/dashboard/transactions/$transactionId/_layout/"
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
    const transaction = await getTransaction({
      data: {
        transactionId: Number(params.transactionId),
      },
    });
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { transaction };
  },
});

function RouteComponent() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { transaction } = Route.useLoaderData();
  const { categories } = useAppContext();
  const navigate = useNavigate();

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
          <span>Edit Transaction</span>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionForm
          defaultValues={{
            amount: Number(transaction?.amount),
            categoryId: transaction?.categoryId,
            description: transaction?.description,
            transactionDate: new Date(transaction?.transactionDate),
            transactionType:
              categories.find(
                (category) => category.id === transaction.categoryId
              )?.type ?? "income",
          }}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
}
