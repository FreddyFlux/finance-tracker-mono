/**
 * Vercel Edge Middleware: preserve original request URL for rewrites.
 * When all requests are rewritten to /api/server, the server may receive
 * the destination URL instead of the original. This adds the original URL
 * as a header so the server can route correctly.
 */
import { next } from '@vercel/functions'

export default function middleware(request: Request) {
	const requestHeaders = new Headers(request.headers)
	requestHeaders.set('x-original-url', request.url)
	return next({
		request: {
			headers: requestHeaders,
		},
	})
}
