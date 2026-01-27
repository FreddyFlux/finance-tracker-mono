import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/contexts/app-context";

interface YearSelectorProps {
  value: number;
  onValueChange: (year: number) => void;
  className?: string;
}

export function YearSelector({
  value,
  onValueChange,
  className,
}: YearSelectorProps) {
  const { yearsRange, isLoading } = useAppContext();

  // Ensure we always have at least the current year
  const currentYear = new Date().getFullYear();
  const displayYears = yearsRange.length > 0 ? yearsRange : [currentYear];

  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => onValueChange(Number(val))}
      disabled={isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading..." : undefined} />
      </SelectTrigger>
      <SelectContent>
        {displayYears.map((year) => (
          <SelectItem key={year.toString()} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
