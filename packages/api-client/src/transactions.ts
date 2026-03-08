import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './client'

// ---- Types ----
export type Transaction = {
	id: number
	userId: string
	description: string
	amount: string
	transactionDate: string
	category: string | null
	transactionType: 'income' | 'expense'
	recurringTransactionId: number | null
}

export type CreateTransactionInput = {
	transactionType: 'income' | 'expense'
	categoryId: number
	transactionDate: string
	amount: number
	description: string
}

export type UpdateTransactionInput = {
	transactionType: 'income' | 'expense'
	categoryId: number
	transactionDate: string
	amount: number
	description: string
}

// ---- Query keys ----
export const transactionKeys = {
	all: ['transactions'] as const,
	byMonth: (year: number, month: number, userIds?: string[]) =>
		[...transactionKeys.all, 'month', year, month, userIds] as const,
	detail: (id: number) => [...transactionKeys.all, id] as const,
	yearsRange: ['transactions', 'years-range'] as const,
}

// ---- Hooks ----
export function useTransactionsByMonth(
	year: number,
	month: number,
	token: string | null,
	userIds?: string[],
) {
	return useQuery({
		queryKey: transactionKeys.byMonth(year, month, userIds),
		queryFn: () => {
			const params = new URLSearchParams({
				year: String(year),
				month: String(month),
				...(userIds?.length ? { userIds: userIds.join(',') } : {}),
			})
			return apiRequest<Transaction[]>(`/api/transactions?${params}`, {
				token: token ?? undefined,
			})
		},
		enabled: !!token,
	})
}

export function useTransaction(id: number, token: string | null) {
	return useQuery({
		queryKey: transactionKeys.detail(id),
		queryFn: () => apiRequest<Transaction>(`/api/transactions/${id}`, { token: token ?? undefined }),
		enabled: !!token && !!id,
	})
}

export function useTransactionYearsRange(token: string | null) {
	return useQuery({
		queryKey: transactionKeys.yearsRange,
		queryFn: () =>
			apiRequest<number[]>('/api/transactions/years-range', { token: token ?? undefined }),
		enabled: !!token,
	})
}

export function useCreateTransaction(token: string | null) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (input: CreateTransactionInput) =>
			apiRequest<Transaction>('/api/transactions', {
				method: 'POST',
				body: JSON.stringify(input),
				token: token ?? undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: transactionKeys.all })
		},
	})
}

export function useUpdateTransaction(token: string | null) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...input }: UpdateTransactionInput & { id: number }) =>
			apiRequest<Transaction>(`/api/transactions/${id}`, {
				method: 'PUT',
				body: JSON.stringify(input),
				token: token ?? undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: transactionKeys.all })
		},
	})
}

export function useDeleteTransaction(token: string | null) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) =>
			apiRequest<{ success: boolean }>(`/api/transactions/${id}`, {
				method: 'DELETE',
				token: token ?? undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: transactionKeys.all })
		},
	})
}
