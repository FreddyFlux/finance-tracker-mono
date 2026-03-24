import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import { UserFilter } from "@/components/user-filter";
import { Button } from "@/components/ui/button";
import { getAnnualCashflow } from "@/data/getAnnualCashflow";
import { getRecentTransactions } from "@/data/getRecentTransactions";
import { dashboardSearchSchema, getCurrentYear } from "@/lib/validation";
import { Cashflow } from "./-cashflow";
import { RecentTransactions } from "./-recent-transactions";

export const Route = createFileRoute("/_authed/dashboard/")({
	pendingComponent: () => (
		<div className="max-w-7xl mx-auto py-5 px-3 bg-violet-800 min-h-screen">
			<h1 className="font-display text-2xl font-medium pb-5 text-white">Dashboard</h1>
			<LoadingSkeleton />
		</div>
	),
	validateSearch: dashboardSearchSchema,
	component: Dashboard,
	loaderDeps: ({ search }) => ({
		cfyear: search.cfyear,
		userIds: search.userIds,
	}),
	loader: async ({ deps, context }) => {
		const currentYear = getCurrentYear();
		// Schema validates strings, so we can safely assert type
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const defaultUserIds: string[] = (deps.userIds as any) ?? [context.userId];
		const [transactions, cashflow] = await Promise.all([
			getRecentTransactions({
				data: {
					userIds: defaultUserIds,
				},
			}),
			getAnnualCashflow({
				data: {
					year: deps.cfyear ?? currentYear,
					userIds: defaultUserIds,
				},
			}),
		]);

		return {
			transactions,
			cashflow,
			cfyear: deps.cfyear ?? currentYear,
			userIds: defaultUserIds,
		};
	},
});

function Dashboard() {
	const { transactions, cashflow, cfyear, userIds } = Route.useLoaderData();
	return (
		<div className="max-w-7xl mx-auto py-5 px-3 bg-violet-800 min-h-screen">
			<h1 className="font-display text-2xl font-medium pb-5 text-white">Dashboard</h1>
			<DashboardFilters initialUserIds={userIds} />
			<Cashflow year={cfyear} annualCashflow={cashflow} />
			<RecentTransactions transactions={transactions} />
		</div>
	);
}

function DashboardFilters({ initialUserIds }: { initialUserIds: string[] }) {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [selectedUserIds, setSelectedUserIds] = useState<string[] | undefined>(
		initialUserIds,
	);

	// Sync state when URL changes (e.g., browser back/forward)
	useEffect(() => {
		setSelectedUserIds(initialUserIds);
	}, [initialUserIds]);

	const handleApplyFilters = () => {
		navigate({
			to: "/dashboard",
			search: {
				cfyear: search.cfyear,
				userIds: selectedUserIds,
			},
		});
	};

	return (
		<div className="mb-5 flex gap-4 items-end">
			<div className="flex-1">
				<UserFilter value={selectedUserIds} onChange={setSelectedUserIds} />
			</div>
			<Button onClick={handleApplyFilters}>Go</Button>
		</div>
	);
}
