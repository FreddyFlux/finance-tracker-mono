import { ClockIcon, UserCheckIcon, UserXIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getConnectionRequests } from "@/data/getConnectionRequests";
import { respondToConnectionRequest } from "@/data/respondToConnectionRequest";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface ConnectionRequestsProps {
  initialData: Awaited<ReturnType<typeof getConnectionRequests>>;
}

export function ConnectionRequests({ initialData }: ConnectionRequestsProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const handleRespond = async (
    connectionId: number,
    action: "accept" | "reject"
  ) => {
    setLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await respondToConnectionRequest({
        data: { connectionId, action },
      });
      // Refresh data
      const updated = await getConnectionRequests({});
      setData(updated);
      showSuccessToast(
        action === "accept"
          ? "Connection accepted"
          : "Connection request rejected"
      );
    } catch (error) {
      showErrorToast(
        "Failed to respond to connection request",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Received Requests */}
      {data.receivedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Pending Requests ({data.receivedRequests.length})
            </CardTitle>
            <CardDescription>
              Connection requests waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {"requesterEmail" in request && request.requesterEmail
                        ? request.requesterEmail
                        : request.requesterUserId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleRespond(request.id, "accept")}
                      disabled={loading[request.id]}
                    >
                      <UserCheckIcon className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(request.id, "reject")}
                      disabled={loading[request.id]}
                    >
                      <UserXIcon className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent Requests */}
      {data.sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Requests ({data.sentRequests.length})</CardTitle>
            <CardDescription>Connection requests you've sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {"recipientEmail" in request && request.recipientEmail
                        ? request.recipientEmail
                        : request.recipientUserId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Requests */}
      {data.receivedRequests.length === 0 && data.sentRequests.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pending connection requests
          </CardContent>
        </Card>
      )}
    </div>
  );
}
