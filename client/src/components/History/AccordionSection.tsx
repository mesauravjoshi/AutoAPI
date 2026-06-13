import { useState } from "react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import { ApiHistory } from '@/types/types'
import HistoryItem from '@/components/History/HistoryItem'

export default function AccordionSection({
  title,
  items,
  onDelete,
  defaultOpen = true,
}: {
  title: string;
  items: ApiHistory[];
  onDelete: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">{title}</span>

          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            {items.length}
          </span>
        </div>

        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

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
    </div>
  );
}
