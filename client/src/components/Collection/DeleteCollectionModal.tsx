import { useState } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle, DialogDescription
} from "@/components/UI/dialog";

type DeleteCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
  selectedCollection: { _id: string; name: string } | null;
};

export const DeleteCollectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedCollection,
}: DeleteCollectionModalProps) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/collection/${selectedCollection._id}`);
      onSuccess(selectedCollection._id);
      onClose();
    } catch (error: any) {
      console.error(
        "Delete collection failed:",
        error?.response?.data?.message || error.message
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!selectedCollection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Collection</DialogTitle>
        </DialogHeader>

        <DialogDescription>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <span className="font-semibold">{selectedCollection.name}</span>?
          </p>

          <p className="text-xs text-gray-500 mt-2">This action cannot be undone.</p>
        </DialogDescription>

        <DialogFooter className="gap-3">
          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          </DialogClose>

          <button
            type="button"
            onClick={handleDeleteCollection}
            disabled={deleteLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};