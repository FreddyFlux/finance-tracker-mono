import { useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'

export type MonthlyCashflow = {
	month: number
	income: number
	expense: number
}

export const cashflowKeys = {
	annual: (year: number, userIds?: string[]) => ['cashflow', year, userIds] as const,
}

export function useAnnualCashflow(
	year: number,
	token: string | null,
	userIds?: string[],
) {
	return useQuery({
		queryKey: cashflowKeys.annual(year, userIds),
		queryFn: () => {
			const params = new URLSearchParams({
				year: String(year),
				...(userIds?.length ? { userIds: userIds.join(',') } : {}),
			})
			return apiRequest<MonthlyCashflow[]>(`/api/cashflow?${params}`, {
				token: token ?? undefined,
			})
		},
		enabled: !!token,
	})
}
