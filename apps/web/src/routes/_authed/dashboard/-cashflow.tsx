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
		<Card className="mb-5">
			<CardHeader className="flex justify-between">
				<span>Cashflow</span>
				<div>
					<YearSelector
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
			<CardContent className="grid grid-cols-[1fr_250px]">
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
					className="w-full h-[300px]"
				>
					<BarChart data={annualCashflow}>
						<CartesianGrid vertical={false} stroke="#5B3FA8" strokeOpacity={0.3} />
						<YAxis tickFormatter={formatCurrencyChart} tick={{ fill: '#B89FD8' }} />
						<XAxis
							dataKey="month"
							tickFormatter={(value) => formatMonth(value, year)}
							tick={{ fill: '#B89FD8' }}
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
							content={<ChartLegendContent className="text-violet-200" />}
							verticalAlign="top"
						/>
						<Bar dataKey="income" fill="var(--color-income)" radius={4} />
						<Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
					</BarChart>
				</ChartContainer>
				<div className="border-l border-violet-700 px-4 flex flex-col gap-2 justify-center">
					<span className="text-xs text-violet-200 uppercase tracking-wide font-medium">Income</span>

					<h2 className="text-number text-amber-400">
						{formatCurrency(totalAnnualIncome)}
					</h2>

					<div className="h-px bg-violet-700 w-full" />

					<span className="text-xs text-violet-200 uppercase tracking-wide font-medium">Expenses</span>

					<h2 className="text-number text-pink-300">
						{formatCurrency(totalAnnualExpense)}
					</h2>

					<div className="h-px bg-violet-700 w-full" />

					<span className="text-xs text-violet-200 uppercase tracking-wide font-medium">Balance</span>

					<h2
						className={cn(
							"text-number-lg",
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
