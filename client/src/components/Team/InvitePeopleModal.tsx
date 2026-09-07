import { useState } from "react";
import { teamService } from "@/services/team.service";
import { MembershipRole, TeamUser } from "@/types/team.type";
import { SearchIcon, XIcon, Loader2Icon } from "lucide-react";

interface Props {
  workspaceId: string;
  onClose: () => void;
  onInvited: () => void;
}

export default function InvitePeopleModal({ workspaceId, onClose, onInvited }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TeamUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);
  const [role, setRole] = useState<MembershipRole>("viewer");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  let debounceRef: ReturnType<typeof setTimeout>;

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedUser(null);
    clearTimeout(debounceRef);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await teamService.searchUsers(workspaceId, value);
        setResults(res.data.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleInvite = async () => {
    setError("");
    const isEmail = /\S+@\S+\.\S+/.test(query);
    if (!selectedUser && !isEmail) {
      setError("Select a user or enter a valid email");
      return;
    }
    setSending(true);
    try {
      console.log(selectedUser);
      
      await teamService.invite(workspaceId, {
        userId: selectedUser?._id,
        email: selectedUser ? undefined : query.trim(),
        role,
      });
      onInvited();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Invite people</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XIcon size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="relative">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, username or email"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {searching && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2Icon size={12} className="animate-spin" /> Searching
            </div>
          )}

          {!selectedUser && results.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
              {results.map((u) => (
                <button
                  key={u._id}
                  onClick={() => {
                    setSelectedUser(u);
                    setResults([]);
                    setQuery(u.email);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                    {u.fullname?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{u.fullname}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MembershipRole)}
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={sending || (!selectedUser && !query.trim())}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {sending ? "Sending..." : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}