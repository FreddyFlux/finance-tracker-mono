import { useQuery } from '@tanstack/react-query'
import { apiRequest } from './client'

export type ConnectionsForFilter = {
	currentUserId: string
	currentUserEmail: string
	connections: Array<{
		id: number
		otherUserId: string
		otherUserEmail: string
		createdAt: string
		updatedAt: string
	}>
}

export const connectionKeys = {
	forFilter: (token: string | null) =>
		['connections', 'for-filter', token ?? 'none'] as const,
}

export function useConnectionsForFilter(token: string | null) {
	return useQuery({
		queryKey: connectionKeys.forFilter(token),
		queryFn: () =>
			apiRequest<ConnectionsForFilter>('/api/connections/for-filter', {
				token: token ?? undefined,
			}),
		enabled: !!token,
	})
}
