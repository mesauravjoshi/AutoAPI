import { useRef, useState } from "react";
import { teamService } from "@/services/team.service";
import { MembershipRole, TeamUser } from "@/types/team.type";
import { SearchIcon, Loader2Icon } from "lucide-react";
import CustomSelect from "@/components/UI/Customselect";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";

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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedUser(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            Search for a teammate or invite someone by email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
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

          <CustomSelect
            value={role}
            onChange={setRole}
            options={[
              { value: "viewer", label: "Viewer" },
              { value: "editor", label: "Editor" },
              { value: "admin", label: "Admin" },
            ]}
            buttonClassName="flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500"
            wrapperClassName="w-full"
            dropdownClassName="top-11 left-0 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden"
          />

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={sending || (!selectedUser && !query.trim())}
          >
            {sending ? "Sending..." : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}