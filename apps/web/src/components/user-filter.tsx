import { useRouteContext } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getConnections } from "@/data/getConnections";
import { generateUserCombinations } from "@/lib/user-combinations";

interface UserFilterProps {
	value?: string[];
	onChange: (userIds: string[] | undefined) => void;
}

export function UserFilter({ value, onChange }: UserFilterProps) {
	const { userId: currentUserId } = useRouteContext({ from: "__root__" });
	const [connectionsData, setConnectionsData] = useState<
		Awaited<ReturnType<typeof getConnections>> | null
	>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadConnections() {
			try {
				const data = await getConnections({});
				setConnectionsData(data);
			} catch (error) {
				console.error("Failed to load connections:", error);
			} finally {
				setLoading(false);
			}
		}
		loadConnections();
	}, []);

	const combinations = useMemo(() => {
		if (!connectionsData || !currentUserId) return [];

		const connectedUserIds = connectionsData.connections.map(
			(conn) => conn.otherUserId,
		);
		const emailMap = new Map<string, string>();
		emailMap.set(
			currentUserId,
			connectionsData.currentUserEmail || currentUserId,
		);
		connectionsData.connections.forEach((conn) => {
			emailMap.set(conn.otherUserId, conn.otherUserEmail);
		});

		const combos = generateUserCombinations(currentUserId, connectedUserIds);

		// Format labels with emails
		return combos.map((combo) => {
			// Format the label
			let label: string;
			if (combo.userIds.length === 1 && combo.userIds[0] === currentUserId) {
				label = "My Transactions";
			} else if (combo.userIds.includes(currentUserId)) {
				const otherEmails = combo.userIds
					.filter((id) => id !== currentUserId)
					.map((id) => emailMap.get(id) || id);
				label = `My Transactions + ${otherEmails.join(" + ")}`;
			} else {
				// Only connected users (without my transactions)
				const emails = combo.userIds.map((id) => emailMap.get(id) || id);
				label = emails.join(" + ");
			}

			return {
				...combo,
				label,
			};
		});
	}, [connectionsData, currentUserId]);

	if (loading) {
		return <div className="text-sm text-muted-foreground">Loading...</div>;
	}

	const handleChange = (newValue: string) => {
		if (newValue === "" || newValue === "my-transactions") {
			// Default to "My Transactions"
			onChange(currentUserId ? [currentUserId] : undefined);
		} else {
			try {
				const userIds = JSON.parse(newValue) as string[];
				onChange(userIds);
			} catch {
				onChange(undefined);
			}
		}
	};

	return (
		<div className="space-y-2">
			<Label htmlFor="user-filter">Filter by User</Label>
			<Select
				value={
					value && value.length > 0
						? JSON.stringify([...value].sort())
						: currentUserId
							? JSON.stringify([currentUserId])
							: "my-transactions"
				}
				onValueChange={handleChange}
			>
				<SelectTrigger id="user-filter" className="w-full">
					<SelectValue placeholder="Select user combination" />
				</SelectTrigger>
				<SelectContent>
					{combinations.map((combo, index) => {
						const comboValue = JSON.stringify([...combo.userIds].sort());
						return (
							<SelectItem key={index} value={comboValue}>
								{combo.label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
}
