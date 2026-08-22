import { Workspace } from "@/types/auth.type";
import { useEffect, useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Check, ChevronRight, Plus } from "lucide-react";

type WorkspaceModalProps = {
  workspaceOpen: boolean;
  setWorkspaceOpen: (open: boolean) => void;
};

export const WorkspaceModal = ({
  workspaceOpen,
  setWorkspaceOpen,
}: WorkspaceModalProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentWorkspace, updateCurrentWorkspace } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!workspaceOpen) return;

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
  }, [workspaceOpen]);

  const changeWorkspace = (workspace: Workspace) => {
    updateCurrentWorkspace(workspace);
    setWorkspaceOpen(false);
  };

  return (
    <Dialog open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Workspaces</DialogTitle>
          <DialogDescription>
            Switch to a different workspace or create a new one.
          </DialogDescription>
        </DialogHeader>

        {/* ── Workspace list ── */}
        <div className="max-h-80 space-y-1.5 overflow-y-auto -mx-1 px-1">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-3 animate-pulse"
              >
                <div className="size-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
                <div className="h-3.5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}

          {!loading &&
            workspaces.map((workspace) => {
              const isCurrent = currentWorkspace?._id === workspace._id;
              return (
                <button
                  key={workspace._id}
                  onClick={() => changeWorkspace(workspace)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? "border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                  }`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-600 text-white">
                    <Building2 className="size-4.5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {workspace.name}
                    </span>
                  </span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                      <Check className="size-3" />
                      Current
                    </span>
                  )}
                </button>
              );
            })}

          {!loading && workspaces.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Building2 className="size-5 text-gray-400 dark:text-gray-500" />
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No workspaces found.
              </p>
            </div>
          )}
        </div>

        {!loading && workspaces.length > 0 && (
          <button
            onClick={() => {
              setWorkspaceOpen(false);
              navigate("/workspace/list");
            }}
            className="flex items-center justify-center gap-1 self-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            View all workspaces
            <ChevronRight className="size-3.5" />
          </button>
        )}

        <DialogFooter className="sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => setWorkspaceOpen(false)}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setWorkspaceOpen(false);
              navigate("/workspace");
            }}
          >
            <Plus className="size-4" />
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};