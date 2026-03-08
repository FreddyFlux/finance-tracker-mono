import { UserMinusIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getConnections } from "@/data/getConnections";
import { removeConnection } from "@/data/removeConnection";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface ConnectionsListProps {
  initialData: Awaited<ReturnType<typeof getConnections>>;
}

export function ConnectionsList({ initialData }: ConnectionsListProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const handleRemove = async (connectionId: number) => {
    if (!confirm("Are you sure you want to remove this connection?")) {
      return;
    }

    setLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await removeConnection({ data: { connectionId } });
      // Refresh data
      const updated = await getConnections({});
      setData(updated);
      showSuccessToast("Connection removed successfully");
    } catch (error) {
      showErrorToast(
        "Failed to remove connection",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5" />
          Your Connections ({data.connections.length})
        </CardTitle>
        <CardDescription>
          Users you're connected with and can view transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.connections.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No connections yet. Send a connection request to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {data.connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {"otherUserEmail" in connection && connection.otherUserEmail
                      ? connection.otherUserEmail
                      : connection.otherUserId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Connected since{" "}
                    {new Date(connection.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemove(connection.id)}
                  disabled={loading[connection.id]}
                >
                  <UserMinusIcon className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
