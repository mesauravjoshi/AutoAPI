// import { Button } from "@/components/UI/button";
import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogClose,
  DialogContent,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
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
  const { currentWorkspace } = useAuth();

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Collection Name
            </label>
            <input
              autoFocus
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCollection();
              }}
              className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-2.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 dark:focus:outline-indigo-400 sm:text-sm/6 transition-colors"
              placeholder="e.g., User API"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <DialogClose asChild>
              <button
                type="button"
                onClick={() => setNewCollectionName("")}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </DialogClose>

            <button
              type="button"
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim()}
              className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              Create
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};