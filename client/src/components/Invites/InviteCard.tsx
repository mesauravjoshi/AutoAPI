import { MyInvite } from "@/types/team.type";
import { Loader2Icon } from "lucide-react";

interface Props {
  invite: MyInvite;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  processingId: string | null;
}

export default function InviteCard({ invite, onAccept, onDecline, processingId }: Props) {
  const isProcessing = processingId === invite._id;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {invite.workspaceId.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Invited by {invite.invitedBy?.fullname ?? "someone"} as{" "}
          <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{invite.role}</span>
          {" · "}
          {new Date(invite.invitedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          disabled={isProcessing}
          onClick={() => onDecline(invite._id)}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Decline
        </button>
        <button
          disabled={isProcessing}
          onClick={() => onAccept(invite._id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {isProcessing && <Loader2Icon size={13} className="animate-spin" />}
          Accept
        </button>
      </div>
    </div>
  );
}