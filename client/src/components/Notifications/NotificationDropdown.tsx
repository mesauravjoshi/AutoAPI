import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  Bell as BellIcon,
  Mail as MailIcon,
  Loader2 as Loader2Icon,
  Check as CheckIcon,
  X as XIcon,
  ArrowRight as ArrowRightIcon,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { teamService } from "@/services/team.service";
import { MyInvite } from "@/types/team.type";

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<MyInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teamService.getMyInvites();
      if (res.data?.data) {
        setInvites(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load invites in notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleAccept = async (e: React.MouseEvent, membershipId: string) => {
    e.stopPropagation();
    setProcessingId(membershipId);
    try {
      await teamService.acceptInvite(membershipId);
      setInvites((prev) => prev.filter((i) => i._id !== membershipId));
    } catch (err) {
      console.error("Failed to accept invite:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (e: React.MouseEvent, membershipId: string) => {
    e.stopPropagation();
    setProcessingId(membershipId);
    try {
      await teamService.declineInvite(membershipId);
      setInvites((prev) => prev.filter((i) => i._id !== membershipId));
    } catch (err) {
      console.error("Failed to decline invite:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleNavigateShowAll = (closePopover: () => void) => {
    closePopover();
    navigate("/invites");
  };

  const unreadCount = invites.length;

  return (
    <Popover className="relative">
      <PopoverButton
        onClick={() => fetchInvites()}
        className="relative -m-2.5 p-2.5 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none cursor-pointer group"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="size-6 transition-transform group-hover:scale-105" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-gray-900 animate-in zoom-in-50 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute right-0 z-50 mt-2.5 w-80 sm:w-96 origin-top-right rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-900/10 dark:shadow-black/50 ring-1 ring-gray-900/5 focus:outline-none transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 overflow-hidden"
      >
        {({ close }) => (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <div className="flex items-center gap-2">
                <MailIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Workspace Invites
                </h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-700/10 dark:ring-indigo-300/20">
                    {unreadCount} pending
                  </span>
                )}
              </div>
            </div>

            {/* List Content */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 custom-scrollbar">
              {loading && invites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 dark:text-gray-500">
                  <Loader2Icon className="size-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium">Checking invites...</span>
                </div>
              ) : invites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-3 text-gray-400 dark:text-gray-500">
                    <SparklesIcon className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    All caught up!
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    No pending workspace invitations at the moment.
                  </p>
                </div>
              ) : (
                invites.map((invite) => {
                  const isProcessing = processingId === invite._id;
                  const workspaceName = invite.workspaceId?.name || "Workspace";
                  const inviterName = invite.invitedBy?.fullname || invite.invitedBy?.email || "Someone";

                  return (
                    <div
                      key={invite._id}
                      className="p-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {workspaceName}
                            </span>
                            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                              {invite.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {inviterName}
                            </span>{" "}
                            invited you to join as a team member.
                          </p>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                            {new Date(invite.invitedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100/80 dark:border-gray-800/40">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => handleAccept(e, invite._id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : (
                            <CheckIcon className="size-3.5" />
                          )}
                          Accept
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => handleDecline(e, invite._id)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer - Show All */}
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <button
                type="button"
                onClick={() => handleNavigateShowAll(close)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <span>Show all invites</span>
                <ArrowRightIcon className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
};
