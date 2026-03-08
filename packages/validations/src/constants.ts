export const TRANSACTION_LIMITS = {
	RECENT_TRANSACTIONS: 5,
	MONTHS_IN_YEAR: 12,
	DESCRIPTION_MIN_LENGTH: 3,
	DESCRIPTION_MAX_LENGTH: 300,
	YEAR_RANGE_OFFSET: 100,
} as const;

export const DATE_FORMATS = {
	DISPLAY_DATE: "do MMM yyyy",
	DISPLAY_MONTH: "MMM",
	DISPLAY_MONTH_YEAR: "MMM yyyy",
	DISPLAY_MONTH_FULL: "MMMM",
	API_DATE: "yyyy-MM-dd",
} as const;

export const CURRENCY_SYMBOL = "€";

export const TRANSACTION_TYPE_COLORS = {
	income: "bg-lime-500",
	expense: "bg-rose-500",
} as const;
