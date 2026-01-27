import { createFileRoute } from "@tanstack/react-router";
import { RecentTransactions } from "./-recent-transactions";
import { getRecentTransactions } from "@/data/getRecentTransactions";
import { getAnnualCashflow } from "@/data/getAnnualCashflow";
import { Cashflow } from "./-cashflow";
import LoadingSkeleton from "@/components/loading-skeleton";
import { dashboardSearchSchema, getCurrentYear } from "@/lib/validation";

export const Route = createFileRoute("/_authed/dashboard/")({
  pendingComponent: () => (
    <div className="max-w-7xl mx-auto py-5 px-3">
      <h1 className="text-4xl font-semibold pb-5">Dashboard</h1>
      <LoadingSkeleton />
    </div>
  ),
  validateSearch: dashboardSearchSchema,
  component: Dashboard,
  loaderDeps: ({ search }) => ({ cfyear: search.cfyear }),
  loader: async ({ deps }) => {
    const currentYear = getCurrentYear();
    const [transactions, cashflow] = await Promise.all([
      getRecentTransactions(),
      getAnnualCashflow({
        data: {
          year: deps.cfyear ?? currentYear,
        },
      }),
    ]);

    return {
      transactions,
      cashflow,
      cfyear: deps.cfyear ?? currentYear,
    };
  },
});

function Dashboard() {
  const { transactions, cashflow, cfyear } = Route.useLoaderData();
  return (
    <div className="max-w-7xl mx-auto py-5 px-3">
      <h1 className="text-4xl font-semibold pb-5">Dashboard</h1>
      <Cashflow year={cfyear} annualCashflow={cashflow} />
      <RecentTransactions transactions={transactions} />
    </div>
  );
}
