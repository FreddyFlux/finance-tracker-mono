import { cn } from "@/lib/utils";

interface EmptyStateProps {
	message?: string;
	className?: string;
}

export function EmptyState({
	message = "No data available",
	className,
}: EmptyStateProps) {
	return (
		<p
			className={cn(
				"text-center py-10 text-lg text-muted-foreground",
				className,
			)}
		>
			{message}
		</p>
	);
}
