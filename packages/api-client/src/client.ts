const getBaseUrl = () => {
	if (process.env.EXPO_PUBLIC_API_URL) {
		return process.env.EXPO_PUBLIC_API_URL
	}
	// Android emulator needs 10.0.2.2 to reach host machine
	// iOS simulator can use localhost
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
