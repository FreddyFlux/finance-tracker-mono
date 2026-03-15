// @ts-ignore
import server from "../dist/server/server.js";

/**
 * Vercel rewrite fix: when all requests are rewritten to /api/server,
 * the server may receive request.url with /api/server instead of the original path.
 * Middleware adds x-original-url; we use it to create a corrected request.
 */
const originalFetch = server.fetch.bind(server);

server.fetch = async function (request, ...args) {
	if (typeof request === "object" && request?.headers) {
		const url = new URL(request.url);
		const originalUrl = request.headers.get("x-original-url");
		// Only fix when we received the rewritten path and have the original
		if (originalUrl && url.pathname === "/api/server") {
			request = new Request(originalUrl, {
				method: request.method,
				headers: request.headers,
				body: request.body,
				redirect: request.redirect,
			});
		}
	}
	return originalFetch(request, ...args);
};

export default server;
