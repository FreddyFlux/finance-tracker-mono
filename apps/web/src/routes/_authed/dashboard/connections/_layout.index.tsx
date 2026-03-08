import { createFileRoute } from "@tanstack/react-router";
import { ConnectionRequests } from "@/components/connection-requests";
import { ConnectionsList } from "@/components/connections-list";
import LoadingSkeleton from "@/components/loading-skeleton";
import { SendConnectionRequest } from "@/components/send-connection-request";
import { getConnectionRequests } from "@/data/getConnectionRequests";
import { getConnections } from "@/data/getConnections";

export const Route = createFileRoute("/_authed/dashboard/connections/_layout/")(
  {
    loader: async () => {
      const [requests, connections] = await Promise.all([
        getConnectionRequests({}),
        getConnections({}),
      ]);
      return { requests, connections };
    },
    pendingComponent: () => <LoadingSkeleton />,
    component: ConnectionsPage,
  }
);

function ConnectionsPage() {
  const { requests, connections } = Route.useLoaderData();

  return (
    <div className="container max-w-4xl mx-auto py-5 px-3">
      <h1 className="text-3xl font-bold mb-6">Manage Connections</h1>
      <div className="space-y-6">
        <SendConnectionRequest />
        <ConnectionRequests initialData={requests} />
        <ConnectionsList initialData={connections} />
      </div>
    </div>
  );
}
