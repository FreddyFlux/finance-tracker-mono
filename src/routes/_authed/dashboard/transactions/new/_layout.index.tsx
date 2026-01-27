import {
  TransactionForm,
  transactionFormSchema,
} from "@/components/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTransaction } from "@/data/createTransaction";
import { getCategories } from "@/data/getCategories";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute(
  "/_authed/dashboard/transactions/new/_layout/"
)({
  component: RouteComponent,
  loader: async () => {
    const categories = await getCategories();
    return { categories };
  },
});

function RouteComponent() {
  const { categories } = Route.useLoaderData();
  const navigate = useNavigate();

  const handleSubmit = async (data: z.infer<typeof transactionFormSchema>) => {
    const transaction = await createTransaction({
      data: {
        amount: data.amount,
        description: data.description,
        transactionDate: format(data.transactionDate, "yyyy-MM-dd"),
        categoryId: data.categoryId,
        transactionType: data.transactionType,
      },
    });

    toast.success("Success!", {
      description: "Transaction created successfully",
      className: "bg-green-500 text-white",
    });
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
        <TransactionForm categories={categories} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}
