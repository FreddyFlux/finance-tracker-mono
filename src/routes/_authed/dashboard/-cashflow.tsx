import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import numeral from "numeral";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

export function Cashflow({
  yearsRange,
  year,
  annualCashflow,
}: {
  yearsRange: number[];
  year: number;
  annualCashflow: {
    month: number;
    income: number;
    expense: number;
  }[];
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
          <Select
            defaultValue={year.toString()}
            onValueChange={(value) => {
              navigate({
                to: "/dashboard",
                search: {
                  cfyear: Number(value),
                },
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearsRange.map((year) => (
                <SelectItem key={year.toString()} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <YAxis
              tickFormatter={(value) => {
                return `€${numeral(value).format("0,0")}  `;
              }}
            />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                return format(new Date(year, value - 1, 1), "MMM");
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    return (
                      <div>
                        {name === "income" ? "Income" : "Expenses"}: €{" "}
                        {numeral(value).format("0,0")}
                      </div>
                    );
                  }}
                  labelFormatter={(value, payload) => {
                    return (
                      <div>
                        {format(
                          new Date(year, payload[0]?.payload?.month - 1, 1),
                          "MMMM"
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
            € {numeral(totalAnnualIncome).format("0,0")}
          </h2>

          <div className="h-px bg-border w-full" />

          <span className="text-m text-muted-foreground">Expenses</span>

          <h2 className="text-3xl font-semibold">
            € {numeral(totalAnnualExpense).format("0,0")}
          </h2>

          <div className="h-px bg-border w-full" />

          <span className="text-m text-muted-foreground">Balance</span>

          <h2
            className={cn(
              "text-3xl font-bold",
              balance > 0 ? "text-green-500" : "text-orange-500"
            )}
          >
            € {numeral(balance).format("0,0")}
          </h2>
        </div>
      </CardContent>
    </Card>
  );
}
