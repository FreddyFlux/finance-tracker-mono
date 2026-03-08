/**
 * Generate all combinations of user IDs from a list
 * Returns all possible combinations including empty array
 */
function generateCombinations<T>(items: T[]): T[][] {
	const combinations: T[][] = [[]];

	for (const item of items) {
		const newCombinations: T[][] = [];
		for (const combo of combinations) {
			newCombinations.push([...combo, item]);
		}
		combinations.push(...newCombinations);
	}

	return combinations;
}

/**
 * Generate all user combination options for filtering transactions
 * Returns combinations including:
 * - My transactions only
 * - My transactions + any combination of connected users
 * - Any combination of connected users (without my transactions)
 */
export function generateUserCombinations(
	currentUserId: string,
	connectedUserIds: string[],
): Array<{ userIds: string[]; label: string }> {
	const combinations: Array<{ userIds: string[]; label: string }> = [];

	// Generate all combinations of connected users
	const connectedCombinations = generateCombinations(connectedUserIds);

	// Add "My Transactions" only
	combinations.push({
		userIds: [currentUserId],
		label: "My Transactions",
	});

	// Add all combinations that include "My Transactions" + connected users
	for (const combo of connectedCombinations) {
		if (combo.length > 0) {
			combinations.push({
				userIds: [currentUserId, ...combo],
				label: `My Transactions + ${combo.join(", ")}`,
			});
		}
	}

	// Add combinations of only connected users (without my transactions)
	for (const combo of connectedCombinations) {
		if (combo.length > 0) {
			combinations.push({
				userIds: combo,
				label: combo.join(" + "),
			});
		}
	}

	return combinations;
}
