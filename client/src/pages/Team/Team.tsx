import { useState } from "react";
import { UsersIcon, UserPlusIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TeamTabs from "@/components/Team/TeamTabs";
import MembersTab from "@/components/Team/MembersTab";
import InvitesTab from "@/components/Team/InvitesTab";
import RequestsTab from "@/components/Team/RequestsTab";
import InvitePeopleModal from "@/components/Team/InvitePeopleModal";

type Tab = "members" | "invites" | "requests";

export default function TeamPage() {
  const { currentWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!currentWorkspace) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-500 dark:text-gray-400">
        Select a workspace first.
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
              <UsersIcon size={16} strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">Team</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentWorkspace.name}</p>
            </div>
          </div>

          {currentWorkspace.type !== "personal" && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 transition-colors"
            >
              <UserPlusIcon size={14} />
              Invite People
            </button>
          )}
        </div>

        <TeamTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === "members" && <MembersTab key={`m-${refreshKey}`} workspaceId={currentWorkspace._id} />}
        {activeTab === "invites" && <InvitesTab key={`i-${refreshKey}`} workspaceId={currentWorkspace._id} />}
        {activeTab === "requests" && <RequestsTab key={`r-${refreshKey}`} workspaceId={currentWorkspace._id} />}
      </div>

      {modalOpen && (
        <InvitePeopleModal
          workspaceId={currentWorkspace._id}
          onClose={() => setModalOpen(false)}
          onInvited={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}