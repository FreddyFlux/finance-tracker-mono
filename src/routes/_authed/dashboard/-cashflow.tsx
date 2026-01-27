import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { YearSelector } from "@/components/year-selector";
import { useNavigate } from "@tanstack/react-router";
import { formatMonth, formatFullMonth, formatCurrencyChart } from "@/lib/formatters";
import numeral from "numeral";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { MonthlyCashflow } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";

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
    0
  );
  const totalAnnualExpense = annualCashflow.reduce(
    (prevResult: number, { expense }) => {
      return prevResult + expense;
    },
    0
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
              color: "#84cc16",
            },
            expense: {
              label: "Expenses",
              color: "#f97316",
            },
          }}
          className="w-full h-[300px]"
        >
          <BarChart data={annualCashflow}>
            <CartesianGrid vertical={false} />
            <YAxis tickFormatter={formatCurrencyChart} />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => formatMonth(value, year)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    return (
                      <div>
                        {name === "income" ? "Income" : "Expenses"}:{" "}
                        {formatCurrency(Number(value))}
                      </div>
                    );
                  }}
                  labelFormatter={(value, payload) => {
                    return (
                      <div>
                        {formatFullMonth(
                          payload[0]?.payload?.month ?? 1,
                          year
                        )}
                      </div>
                    );
                  }}
                />
              }
            />
            <Legend align="right" verticalAlign="top" />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
        <div className="border-l px-4 flex flex-col gap-2 justify-center">
          <span className="text-m text-muted-foreground">Income</span>

          <h2 className="text-3xl font-semibold">
            {formatCurrency(totalAnnualIncome)}
          </h2>

          <div className="h-px bg-border w-full" />

          <span className="text-m text-muted-foreground">Expenses</span>

          <h2 className="text-3xl font-semibold">
            {formatCurrency(totalAnnualExpense)}
          </h2>

          <div className="h-px bg-border w-full" />

          <span className="text-m text-muted-foreground">Balance</span>

          <h2
            className={cn(
              "text-3xl font-bold",
              balance > 0 ? "text-green-500" : "text-orange-500"
            )}
          >
            {formatCurrency(balance)}
          </h2>
        </div>
      </CardContent>
    </Card>
  );
}
