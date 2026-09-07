import { useEffect, useState } from "react";
import { MailIcon, Loader2Icon } from "lucide-react";
import { teamService } from "@/services/team.service";
import { MyInvite, MyRequest } from "@/types/team.type";
import InviteCard from "@/components/Invites/InviteCard";
import RequestStatusCard from "@/components/Invites/RequestStatusCard";
// import { useAuth } from "@/hooks/useAuth";

type Tab = "invites" | "requests";

export default function MyInvitesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("invites");
  const [invites, setInvites] = useState<MyInvite[]>([]);
  const [requests, setRequests] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  // const { refreshWorkspaces } = useAuth(); // assumes your auth hook can re-fetch/update workspaces list
  // console.log(invites);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [invitesResult, requestsResult] = await Promise.allSettled([
        teamService.getMyInvites(),
        teamService.getMyRequests(),
      ]);

      if (invitesResult.status === "fulfilled") {
        setInvites(invitesResult.value.data.data);
      } else {
        console.error("Failed to load invites:", invitesResult.reason);
      }

      if (requestsResult.status === "fulfilled") {
        setRequests(requestsResult.value.data.data);
      } else {
        console.error("Failed to load requests:", requestsResult.reason);
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (membershipId: string) => {
    setProcessingId(membershipId);
    try {
      await teamService.acceptInvite(membershipId);
      setInvites((prev) => prev.filter((i) => i._id !== membershipId));
      // await refreshWorkspaces?.(); // pull the newly joined workspace into the switcher
    } catch (err) {
      console.error("Failed to accept invite", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (membershipId: string) => {
    setProcessingId(membershipId);
    try {
      await teamService.declineInvite(membershipId);
      setInvites((prev) => prev.filter((i) => i._id !== membershipId));
    } catch (err) {
      console.error("Failed to decline invite", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
            <MailIcon size={16} strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
              My Invites
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Workspace invites and join requests
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 mb-4">
          <button
            onClick={() => setActiveTab("invites")}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "invites"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            Invites {invites.length > 0 && `(${invites.length})`}
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "requests"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            My Requests
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400 dark:text-gray-500">
            <Loader2Icon size={15} className="animate-spin" />
            Loading
          </div>
        ) : activeTab === "invites" ? (
          invites.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-10 text-center">
              No pending invites
            </p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <InviteCard
                  key={invite._id}
                  invite={invite}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  processingId={processingId}
                />
              ))}
            </div>
          )
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-10 text-center">
            You haven't requested to join any workspace
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => (
              <RequestStatusCard key={request._id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}