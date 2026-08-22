// import { Button } from "@/components/UI/button";
import { useState } from "react";
import { FolderPlus } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/UI/dialog";

type CreateCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const CreateCollectionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateCollectionModalProps) => {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentWorkspace } = useAuth();

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post("/collection", {
        name: newCollectionName,
        workspaceId: currentWorkspace?._id,
      });
      setNewCollectionName("");
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 shadow-md shadow-blue-500/20">
              <FolderPlus className="size-5 text-white" />
            </span>
            <div>
              <DialogTitle>Create Collection</DialogTitle>
              <DialogDescription>
                Group related requests together for easy access.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Collection Name
            </label>
            <input
              autoFocus
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCollection();
              }}
              className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
              placeholder="e.g., User API"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild>
              <button
                type="button"
                onClick={() => setNewCollectionName("")}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </DialogClose>

            <button
              type="button"
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim() || isSubmitting}
              className="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {isSubmitting ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};