import { useState } from "react";
import {
  ChevronDown as ChevronDownIcon, Trash2Icon,
  // EllipsisVertical
} from "lucide-react";
import { ApiHistory } from '@/types/types'
import HistoryItem from '@/components/History/HistoryItem'
import { Button } from "@/components/UI/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/UI/dialog"

export default function AccordionSection({
  title,
  items,
  onDelete,
  onBulkDelete,
  defaultOpen = false,
}: {
  title: string;
  items: ApiHistory[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleBulkDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onBulkDelete(items.map((item) => item._id));
    setConfirmOpen(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header row — a div (not a button) since it now contains its own interactive buttons */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(!open);
        }}
        className="group w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">{title}</span>

          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Bulk delete — only visible on row hover */}
          <button
            type="button"
            onClick={handleBulkDeleteClick}
            aria-label={`Delete all history from ${title}`}
            title="Delete all from this day"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2Icon className="h-4 w-4" />
          </button>

          {/* More options — display only for now, no action wired up */}
          {/* <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            aria-label="More options"
            title="More options"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <EllipsisVertical className="h-4 w-4" />
          </button> */}

          <ChevronDownIcon
            className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""
              }`}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${open ? "max-h-300" : "max-h-0"
          }`}
      >
        <div className="p-4 pt-0 space-y-3">
          {items.map((item) => (
            <HistoryItem
              key={item._id}
              item={item}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Bulk delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {title} history?</DialogTitle>
            <DialogDescription>
              This will permanently delete {items.length}{" "}
              {items.length === 1 ? "request" : "requests"} from {title}. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}