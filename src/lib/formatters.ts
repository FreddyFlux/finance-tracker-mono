import { format } from "date-fns";
import numeral from "numeral";
import { CURRENCY_SYMBOL, DATE_FORMATS } from "./constants";

/**
 * Formats a date string or Date object to a display format
 */
export function formatDisplayDate(date: string | Date): string {
	return format(new Date(date), DATE_FORMATS.DISPLAY_DATE);
}

/**
 * Formats a date to API format (yyyy-MM-dd)
 */
export function formatApiDate(date: Date): string {
	return format(date, DATE_FORMATS.API_DATE);
}

/**
 * Formats a month number to display format (MMM)
 */
export function formatMonth(month: number, year: number): string {
	return format(new Date(year, month - 1, 1), DATE_FORMATS.DISPLAY_MONTH);
}

/**
 * Formats a month and year to display format (MMM yyyy)
 */
export function formatMonthYear(month: number, year: number): string {
	return format(new Date(year, month - 1, 1), DATE_FORMATS.DISPLAY_MONTH_YEAR);
}

/**
 * Formats a month number to full month name (MMMM)
 */
export function formatFullMonth(month: number, year: number): string {
	return format(new Date(year, month - 1, 1), DATE_FORMATS.DISPLAY_MONTH_FULL);
}

/**
 * Formats a currency amount with symbol
 */
export function formatCurrency(
	amount: number | string,
	showDecimals = false,
): string {
	const numAmount = typeof amount === "string" ? Number(amount) : amount;
	const formatString = showDecimals ? "0,0[.]00" : "0,0";
	return `${CURRENCY_SYMBOL} ${numeral(numAmount).format(formatString)}`;
}

/**
 * Formats a currency amount for chart display
 */
export function formatCurrencyChart(value: number): string {
	return `${CURRENCY_SYMBOL}${numeral(value).format("0,0")}  `;
}
