import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
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
import { Workspace } from "@/types/workspace.type";
import toast from "react-hot-toast";
import axios from "axios";

interface DeleteWorkspaceModalProps {
  workspace: Workspace | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedWorkspaceId: string) => void;
}

export const DeleteWorkspaceModal = ({
  workspace,
  isOpen,
  onClose,
  onSuccess,
}: DeleteWorkspaceModalProps) => {
  const [enteredName, setEnteredName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetName = workspace?.name || "";
  const isMatch = enteredName.trim() === targetName;

  const handleClose = () => {
    if (isDeleting) return;
    setEnteredName("");
    setError(null);
    onClose();
  };

  const handleDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!workspace) return;

    if (!isMatch) {
      setError("Please enter the exact workspace name to confirm.");
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const res = await api.delete(`/workspaces/${workspace._id}`);
      toast.success(res.data?.message || "Workspace deleted successfully");

      handleClose();
      onSuccess(workspace._id);
    } catch (err: unknown) {
      let message = "Failed to delete workspace. Please try again.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!workspace) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => (!val ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-md p-6 gap-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-900 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center gap-3 bg-transparent">
          {/* Warning Icon Badge */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500/20 dark:bg-red-500/30 blur-md" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/60 ring-8 ring-red-50/50 dark:ring-red-950/30 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-1.5 mt-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
              Delete Workspace
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              All members will lose access, and all associated data will be permanently deleted.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleDelete} className="space-y-4">
          <div className="rounded-lg bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-3.5 text-xs text-red-700 dark:text-red-300">
            <p className="font-medium">
              To verify deletion, please type the workspace name below:
            </p>
            <p className="font-mono font-semibold mt-1 text-gray-900 dark:text-gray-100 select-all">
              {targetName}
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm-workspace-name"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Workspace Name
            </label>
            <input
              id="confirm-workspace-name"
              type="text"
              value={enteredName}
              onChange={(e) => {
                setEnteredName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={targetName}
              autoComplete="off"
              disabled={isDeleting}
              className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500 transition-all"
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="size-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="m-0 p-0 border-t-0 flex flex-row gap-3 justify-end bg-transparent pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={handleClose}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-all cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              disabled={!isMatch || isDeleting}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white dark:text-gray-200 font-medium shadow-md hover:shadow-lg transition-all cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Workspace</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
