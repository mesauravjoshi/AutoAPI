import { useEffect, useState } from "react";
import { teamService } from "@/services/team.service";
import { Membership } from "@/types/team.type";
import TeamTableShell from "@/components/Shared/TeamTableShell";
import RoleBadge from "@/components/Shared/RoleBadge";
import UserCell from "@/components/Shared/UserCell";
import { useAuth } from "@/hooks/useAuth";
import { XIcon } from "lucide-react";

const headers = ["Member", "Role", "Joined", ""];

export default function MembersTab({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await teamService.getMembers(workspaceId);
      setMembers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  const handleRemove = async (membershipId: string) => {
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await teamService.removeMember(workspaceId, membershipId);
      setMembers((prev) => prev.filter((m) => m._id !== membershipId));
    } catch (err) {
      console.error("Failed to remove member", err);
    }
  };

  return (
    <TeamTableShell
      headers={headers}
      loading={loading}
      isEmpty={members.length === 0}
      emptyLabel="No members yet"
      loadingLabel="Loading members"
    >
      {members.map((m) => {
        const isMe = m.userId?._id === user?.id;
        return (
          <tr key={m._id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
            <td className="px-4 py-3 pl-5">
              <UserCell user={m.userId} fallbackEmail={m.email} />
            </td>
            <td className="px-4 py-3">
              <RoleBadge role={m.role} />
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
            </td>
            <td className="px-4 py-3 pr-5 text-right">
              {m.role !== "owner" && !isMe && (
                <button
                  onClick={() => handleRemove(m._id)}
                  className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <XIcon size={14} />
                  Remove
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </TeamTableShell>
  );
}