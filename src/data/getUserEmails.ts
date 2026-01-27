import { createServerFn } from "@tanstack/react-start";
import authMiddleware from "middlewares/authMiddleware";
import { clerkClient } from "@clerk/clerk-sdk-node";
import z from "zod";

const schema = z.object({
	userIds: z.array(z.string()),
});

async function getUserEmail(userId: string): Promise<string> {
	try {
		const user = await clerkClient.users.getUser(userId);
		const primaryEmail = user.emailAddresses.find(
			(email) => email.id === user.primaryEmailAddressId,
		);
		return (
			primaryEmail?.emailAddress ||
			user.emailAddresses[0]?.emailAddress ||
			userId
		);
	} catch (error) {
		console.error(`Failed to fetch email for user ${userId}:`, error);
		return userId; // Fallback to user ID if email lookup fails
	}
}

export const getUserEmails = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator((data: z.infer<typeof schema>) => schema.parse(data))
	.handler(async ({ data }) => {
		const emailMap = new Map<string, string>();
		await Promise.all(
			data.userIds.map(async (id) => {
				const email = await getUserEmail(id);
				emailMap.set(id, email);
			}),
		);
		return Object.fromEntries(emailMap);
	});
