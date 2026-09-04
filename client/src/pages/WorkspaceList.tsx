import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Workspace } from "@/types/workspace.type";
import { BlocksIcon, ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const headers = ["Name", "Owner", "Created", "Updated", ""];

export default function WorkspaceList() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, currentWorkspace, updateCurrentWorkspace } = useAuth();
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const response = await api.get("/workspaces");
        setWorkspaces(response.data.data);
      } catch (error) {
        console.error("Failed to fetch workspaces", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
              <BlocksIcon size={16} strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
                Workspaces
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {workspaces.length} total
              </p>
            </div>
          </div>

          {currentWorkspace && (
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 pl-1 pr-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Active —
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {currentWorkspace.name}
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 dark:text-gray-500 first:pl-5 last:pr-5"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                      <Loader2Icon size={15} className="animate-spin" />
                      Loading workspaces
                    </div>
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No workspaces yet
                    </p>
                  </td>
                </tr>
              ) : (
                workspaces.map((workspace) => {
                  const isMine = workspace.owner._id === user?.id;
                  const isActive = currentWorkspace?._id === workspace._id;
                  return (
                    <tr
                      key={workspace._id}
                      className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-4 py-3 pl-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {workspace.name}
                          </span>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isMine ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                            Me
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {workspace.owner.fullname}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(workspace.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(workspace.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 pr-5 whitespace-nowrap text-right">
                        <button
                          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          onClick={() => {
                            updateCurrentWorkspace({
                              ...workspace,
                              ownerId: workspace.owner._id,
                            });
                            Navigate("/collections");
                          }}
                        >
                          Switch
                          <ArrowRightIcon size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}