import { createFileRoute } from "@tanstack/react-router";
import { AllTransactions } from "./-all-transactions";
import { getTransactionsByMonth } from "@/data/getTransactionsByMonth";
import {
  transactionsSearchSchema,
  getCurrentMonth,
  getCurrentYear,
} from "@/lib/validation";

export const Route = createFileRoute(
  "/_authed/dashboard/transactions/_layout/"
)({
  component: RouteComponent,
  validateSearch: transactionsSearchSchema,
  loaderDeps: ({ search }) => {
    return {
      month: search.month,
      year: search.year,
    };
  },
  // Cannot destructure params from loader, so we need to use the loaderDeps
  loader: async ({ deps }) => {
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const transactions = await getTransactionsByMonth({
      data: {
        month: deps.month ?? currentMonth,
        year: deps.year ?? currentYear,
      },
    });
    return {
      month: deps.month ?? currentMonth,
      year: deps.year ?? currentYear,
      transactions,
    };
  },
});

function RouteComponent() {
  const { month, year, transactions } = Route.useLoaderData();

  return (
    <AllTransactions
      transactions={transactions}
      month={month}
      year={year}
    />
  );
}
