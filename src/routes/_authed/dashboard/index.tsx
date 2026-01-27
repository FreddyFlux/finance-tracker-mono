import { createFileRoute } from "@tanstack/react-router";
import { RecentTransactions } from "./-recent-transactions";
import { getRecentTransactions } from "@/data/getRecentTransactions";
import { getAnnualCashflow } from "@/data/getAnnualCashflow";
import { getTransactionYearsRange } from "@/data/getTransactionYearsRange";
import { Cashflow } from "./-cashflow";
import z from "zod";
import LoadingSkeleton from "@/components/loading-skeleton";

const today = new Date();

const searchSchema = z.object({
  cfyear: z
    .number()
    .min(today.getFullYear() - 100)
    .max(today.getFullYear())
    .catch(today.getFullYear())
    .optional(),
});

export const Route = createFileRoute("/_authed/dashboard/")({
  pendingComponent: () => (
    <div className="max-w-7xl mx-auto py-5 px-3">
      <h1 className="text-4xl font-semibold pb-5">Dashboard</h1>
      <LoadingSkeleton />
    </div>
  ),
  validateSearch: searchSchema,
  component: Dashboard,
  loaderDeps: ({ search }) => ({ cfyear: search.cfyear }),
  loader: async ({ deps }) => {
    const [transactions, cashflow, yearsRange] = await Promise.all([
      getRecentTransactions(),
      getAnnualCashflow({
        data: {
          year: deps.cfyear ?? today.getFullYear(),
        },
      }),
      getTransactionYearsRange(),
    ]);

    return {
      transactions,
      cashflow,
      yearsRange,
      cfyear: deps.cfyear ?? today.getFullYear(),
    };
  },
});

function Dashboard() {
  const { transactions, cashflow, yearsRange, cfyear } = Route.useLoaderData();
  console.log(cashflow);
  return (
    <div className="max-w-7xl mx-auto py-5 px-3">
      <h1 className="text-4xl font-semibold pb-5">Dashboard</h1>
      <Cashflow
        yearsRange={yearsRange}
        year={cfyear}
        annualCashflow={cashflow}
      />
      <RecentTransactions transactions={transactions} />
    </div>
  );
}
