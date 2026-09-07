import { useEffect, useState } from "react";
import { teamService } from "@/services/team.service";
import { Membership } from "@/types/team.type";
import TeamTableShell from "@/components/Shared/TeamTableShell";
import RoleBadge from "@/components/Shared/RoleBadge";
import UserCell from "@/components/Shared/UserCell";

const headers = ["Invited", "Role", "Invited by", "Sent"];

export default function InvitesTab({ workspaceId }: { workspaceId: string }) {
  const [invites, setInvites] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await teamService.getInvites(workspaceId);
        setInvites(res.data.data);
      } catch (err) {
        console.error("Failed to fetch invites", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId]);

  return (
    <TeamTableShell
      headers={headers}
      loading={loading}
      isEmpty={invites.length === 0}
      emptyLabel="No pending invites"
      loadingLabel="Loading invites"
    >
      {invites.map((inv) => (
        <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
          <td className="px-4 py-3 pl-5">
            <UserCell user={inv.userId} fallbackEmail={inv.email} />
          </td>
          <td className="px-4 py-3">
            <RoleBadge role={inv.role} />
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            {inv.invitedBy?.fullname ?? "—"}
          </td>
          <td className="px-4 py-3 pr-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {new Date(inv.invitedAt).toLocaleDateString()}
          </td>
        </tr>
      ))}
    </TeamTableShell>
  );
}