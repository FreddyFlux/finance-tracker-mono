import {
  TransactionForm,
  transactionFormSchema,
} from "@/components/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTransaction } from "@/data/createTransaction";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatApiDate } from "@/lib/formatters";
import { showSuccessToast } from "@/lib/toast";
import z from "zod";

export const Route = createFileRoute(
  "/_authed/dashboard/transactions/new/_layout/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (data: z.infer<typeof transactionFormSchema>) => {
    await createTransaction({
      data: {
        amount: data.amount,
        description: data.description,
        transactionDate: formatApiDate(data.transactionDate),
        categoryId: data.categoryId,
        transactionType: data.transactionType,
      },
    });

    showSuccessToast("Success!", "Transaction created successfully");
    navigate({
      to: "/dashboard/transactions",
      search: {
        month: data.transactionDate.getMonth() + 1,
        year: data.transactionDate.getFullYear(),
      },
    });
  };

  return (
    <Card className="max-w-3xl mt-4">
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionForm onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}
