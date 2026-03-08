const getBaseUrl = () => {
	if (process.env.EXPO_PUBLIC_API_URL) {
		return process.env.EXPO_PUBLIC_API_URL
	}
	// NOTE: localhost:3000 works for iOS simulator only.
	// For Android emulator use your Mac's local IP e.g. http://192.168.x.x:3000
	// Always set EXPO_PUBLIC_API_URL in apps/mobile/.env for local dev
	return 'http://localhost:3000'
}

export async function apiRequest<T>(
	path: string,
	options: RequestInit & { token?: string } = {},
): Promise<T> {
	const { token, ...fetchOptions } = options
	const res = await fetch(`${getBaseUrl()}${path}`, {
		...fetchOptions,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...fetchOptions.headers,
		},
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: 'Unknown error' }))
		throw new Error(error.error ?? `Request failed: ${res.status}`)
	}

	return res.json() as Promise<T>
}
