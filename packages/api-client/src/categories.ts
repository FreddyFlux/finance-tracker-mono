import { useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'

export type Category = {
	id: number
	name: string
	type: 'income' | 'expense'
}

export function useCategories(token: string | null) {
	return useQuery({
		queryKey: ['categories'],
		queryFn: () => apiRequest<Category[]>('/api/categories', { token: token ?? undefined }),
		enabled: !!token,
		staleTime: 1000 * 60 * 60, // categories rarely change, cache for 1 hour
	})
}
