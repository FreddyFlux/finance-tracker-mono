import { useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { YearSelector } from "@/components/year-selector";
import {
	formatCurrency,
	formatCurrencyChart,
	formatFullMonth,
	formatMonth,
} from "@/lib/formatters";
import type { MonthlyCashflow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Cashflow({
	year,
	annualCashflow,
}: {
	year: number;
	annualCashflow: MonthlyCashflow[];
}) {
	const totalAnnualIncome = annualCashflow.reduce(
		(prevResult: number, { income }) => {
			return prevResult + income;
		},
		0,
	);
	const totalAnnualExpense = annualCashflow.reduce(
		(prevResult: number, { expense }) => {
			return prevResult + expense;
		},
		0,
	);
	const balance = totalAnnualIncome - totalAnnualExpense;

	const navigate = useNavigate();
	return (
		<Card className="mb-5 max-w-full overflow-hidden">
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<span>Cashflow</span>
				<div className="w-full sm:w-auto sm:shrink-0">
					<YearSelector
						className="w-full sm:w-[min(100%,11rem)]"
						value={year}
						onValueChange={(selectedYear) => {
							navigate({
								to: "/dashboard",
								search: {
									cfyear: selectedYear,
								},
							});
						}}
					/>
				</div>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_250px] md:gap-0 md:divide-x md:divide-violet-700">
				<div className="min-w-0 w-full">
					<ChartContainer
						config={{
							income: {
								label: "Income",
								color: "#FFBE4D",
							},
							expense: {
								label: "Expenses",
								color: "#D966A8",
							},
						}}
						className="aspect-auto h-[260px] w-full min-w-0 sm:h-[300px]"
					>
						<BarChart data={annualCashflow} margin={{ left: 0, right: 4, top: 8, bottom: 4 }}>
							<CartesianGrid vertical={false} stroke="#5B3FA8" strokeOpacity={0.3} />
							<YAxis
								tickFormatter={formatCurrencyChart}
								tick={{ fill: "#B89FD8", fontSize: 10 }}
								width={52}
							/>
							<XAxis
								dataKey="month"
								tickFormatter={(value) => formatMonth(value, year)}
								tick={{ fill: "#B89FD8", fontSize: 10 }}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value, name) => {
											const isIncome = name === "income";
											return (
												<div>
													{isIncome ? "Income" : "Expenses"}:{" "}
													<span className={isIncome ? "text-amber-400" : "text-pink-300"}>
														{formatCurrency(Number(value))}
													</span>
												</div>
											);
										}}
										labelFormatter={(_value, payload) => {
											return (
												<div>
													{formatFullMonth(payload[0]?.payload?.month ?? 1, year)}
												</div>
											);
										}}
									/>
								}
							/>
							<ChartLegend
								content={<ChartLegendContent className="text-violet-200 flex-wrap justify-start gap-x-4 gap-y-2" />}
								verticalAlign="top"
							/>
							<Bar dataKey="income" fill="var(--color-income)" radius={4} />
							<Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
						</BarChart>
					</ChartContainer>
				</div>
				<div className="flex min-w-0 flex-col justify-center gap-2 border-t border-violet-700 pt-4 md:border-t-0 md:px-4 md:pt-0">
					<span className="text-xs text-violet-200 uppercase tracking-wide font-medium">Income</span>

					<h2 className="text-number wrap-break-word text-amber-400">
						{formatCurrency(totalAnnualIncome)}
					</h2>

					<div className="h-px w-full bg-violet-700" />

					<span className="text-xs text-violet-200 uppercase tracking-wide font-medium">Expenses</span>

					<h2 className="text-number wrap-break-word text-pink-300">
						{formatCurrency(totalAnnualExpense)}
					</h2>

					<div className="h-px w-full bg-violet-700" />

					<span className="text-xs text-violet-200 uppercase tracking-wide font-medium">Balance</span>

					<h2
						className={cn(
							"text-number-lg wrap-break-word",
							balance > 0 ? "amount-positive" : "amount-negative",
						)}
					>
						{formatCurrency(balance)}
					</h2>
				</div>
			</CardContent>
		</Card>
	);
}
