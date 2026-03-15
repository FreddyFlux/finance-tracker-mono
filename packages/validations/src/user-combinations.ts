/**
 * Generate all combinations of items from a list
 */
function generateCombinations<T>(items: T[]): T[][] {
	const combinations: T[][] = [[]]

	for (const item of items) {
		const newCombinations: T[][] = []
		for (const combo of combinations) {
			newCombinations.push([...combo, item])
		}
		combinations.push(...newCombinations)
	}

	return combinations
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
): Array<{ userIds: string[] }> {
	const combinations: Array<{ userIds: string[] }> = []

	const connectedCombinations = generateCombinations(connectedUserIds)

	combinations.push({ userIds: [currentUserId] })

	for (const combo of connectedCombinations) {
		if (combo.length > 0) {
			combinations.push({
				userIds: [currentUserId, ...combo],
			})
		}
	}

	for (const combo of connectedCombinations) {
		if (combo.length > 0) {
			combinations.push({
				userIds: combo,
			})
		}
	}

	return combinations
}
