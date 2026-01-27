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

  if (isLoading) {
    return (
      <SelectTrigger className={className} disabled>
        <SelectValue placeholder="Loading..." />
      </SelectTrigger>
    );
  }

  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => onValueChange(Number(val))}
    >
      <SelectTrigger className={className}>
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
  );
}
