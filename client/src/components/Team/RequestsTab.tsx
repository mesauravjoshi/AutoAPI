import { useEffect, useState } from "react";
import { teamService } from "@/services/team.service";
import { Membership } from "@/types/team.type";
import TeamTableShell from "@/components/Shared/TeamTableShell";
import UserCell from "@/components/Shared/UserCell";
import { CheckIcon, XIcon } from "lucide-react";

const headers = ["Requested", "Requested on", ""];

export default function RequestsTab({ workspaceId }: { workspaceId: string }) {
  const [requests, setRequests] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await teamService.getRequests(workspaceId);
      setRequests(res.data.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [workspaceId]);

  const respond = async (membershipId: string, approve: boolean) => {
    try {
      if (approve) await teamService.approveRequest(workspaceId, membershipId);
      else await teamService.rejectRequest(workspaceId, membershipId);
      setRequests((prev) => prev.filter((r) => r._id !== membershipId));
    } catch (err) {
      console.error("Failed to respond to request", err);
    }
  };

  return (
    <TeamTableShell
      headers={headers}
      loading={loading}
      isEmpty={requests.length === 0}
      emptyLabel="No join requests"
      loadingLabel="Loading requests"
    >
      {requests.map((r) => (
        <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
          <td className="px-4 py-3 pl-5">
            <UserCell user={r.userId} fallbackEmail={r.email} />
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            {new Date(r.createdAt).toLocaleDateString()}
          </td>
          <td className="px-4 py-3 pr-5 text-right">
            <div className="inline-flex items-center gap-2">
              <button
                onClick={() => respond(r._id, true)}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                title="Approve"
              >
                <CheckIcon size={15} />
              </button>
              <button
                onClick={() => respond(r._id, false)}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Reject"
              >
                <XIcon size={15} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </TeamTableShell>
  );
}