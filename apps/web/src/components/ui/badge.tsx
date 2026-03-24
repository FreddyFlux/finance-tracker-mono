import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-full border-0 px-2.5 py-1 text-[10px] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"bg-violet-100 text-violet-700",
				violet:
					"bg-violet-100 text-violet-700",
				amber:
					"bg-amber-100 text-amber-700",
				success:
					"bg-[#E1F5EE] text-[#0F6E56]",
				danger:
					"bg-[#FAECE7] text-[#993C1D]",
				pink:
					"bg-pink-100 text-[#8B3570]",
				outline:
					"border border-violet-400 text-violet-200 [a&]:hover:bg-violet-700/50",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
