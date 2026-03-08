import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/contexts/app-context";
import { TRANSACTION_LIMITS } from "@/lib/constants";
import { formatMonth } from "@/lib/formatters";

interface MonthYearSelectorProps {
	year: number;
	month: number;
	onMonthChange: (month: number) => void;
	onYearChange: (year: number) => void;
}

export function MonthYearSelector({
	year,
	month,
	onMonthChange,
	onYearChange,
}: MonthYearSelectorProps) {
	const { yearsRange, isLoading } = useAppContext();

	return (
		<>
			<Select
				value={month.toString()}
				onValueChange={(value) => onMonthChange(Number(value))}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{Array.from({ length: TRANSACTION_LIMITS.MONTHS_IN_YEAR }, (_, i) => {
						const monthNum = i + 1;
						return (
							<SelectItem key={monthNum} value={monthNum.toString()}>
								{formatMonth(monthNum, year)}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
			<Select
				value={year.toString()}
				onValueChange={(value) => onYearChange(Number(value))}
				disabled={isLoading}
			>
				<SelectTrigger>
					<SelectValue placeholder={isLoading ? "Loading..." : undefined} />
				</SelectTrigger>
				<SelectContent>
					{yearsRange.map((y) => (
						<SelectItem value={y.toString()} key={y.toString()}>
							{y}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
}
