import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Workspace } from "@/types/workspace.type";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const headers = ["Name", "Owner", "Created At", "Updated At", "Switch"];

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
    <>
      <div className="py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
        <div className="mx-auto py-4 max-w-5xl">
          <div className="mb-6">
            <div className="flex justify-between">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                All workspaces
              </h1>
              <p className="text-sm text-gray-900 dark:text-white">
                Active workspaces: {currentWorkspace ? currentWorkspace.name : "None"}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage all your workspaces.
            </p>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {headers.map((header) => (
                    <th key={header} className="px-6 py-4">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading workspaces...
                    </td>
                  </tr>
                ) : workspaces.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No workspaces found.
                    </td>
                  </tr>
                ) : (
                  workspaces.map((workspace) => (
                    <tr key={workspace._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {workspace.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {workspace.owner._id === user?.id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                            Me
                          </span>
                        ) : (
                          workspace.owner.fullname
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(workspace.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(workspace.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                          onClick={() => {
                            updateCurrentWorkspace({
                              ...workspace,
                              ownerId: workspace.owner._id
                            });
                            Navigate('/collections')
                          }}
                        >
                          Switch
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
