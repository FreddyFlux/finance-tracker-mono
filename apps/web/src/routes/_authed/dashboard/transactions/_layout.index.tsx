import { createFileRoute } from "@tanstack/react-router";
import { getTransactionsByMonth } from "@/data/getTransactionsByMonth";
import {
	getCurrentMonth,
	getCurrentYear,
	transactionsSearchSchema,
} from "@/lib/validation";
import { AllTransactions } from "./-all-transactions";

export const Route = createFileRoute(
	"/_authed/dashboard/transactions/_layout/",
)({
	component: RouteComponent,
	validateSearch: transactionsSearchSchema,
	loaderDeps: ({ search }) => {
		return {
			month: search.month,
			year: search.year,
			userIds: search.userIds,
		};
	},
	// Cannot destructure params from loader, so we need to use the loaderDeps
	loader: async ({ deps, context }) => {
		const currentMonth = getCurrentMonth();
		const currentYear = getCurrentYear();
		// Schema validates strings, so we can safely assert type
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const defaultUserIds: string[] = (deps.userIds as any) ?? [context.userId];
		const transactions = await getTransactionsByMonth({
			data: {
				month: deps.month ?? currentMonth,
				year: deps.year ?? currentYear,
				userIds: defaultUserIds,
			},
		});
		return {
			month: deps.month ?? currentMonth,
			year: deps.year ?? currentYear,
			userIds: defaultUserIds,
			transactions,
		};
	},
});

function RouteComponent() {
	const { month, year, userIds, transactions } = Route.useLoaderData();

	return (
		<AllTransactions
			transactions={transactions}
			month={month}
			year={year}
			userIds={userIds}
		/>
	);
}
