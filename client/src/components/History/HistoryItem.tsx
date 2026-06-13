import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  LinkIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { ApiHistory } from '@/types/types';
import Tooltip from '@/components/Tooltip';
import { addTabFromHistory } from '@/store/Slice/tabSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/Store';

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function methodBadge(method: string) {
  const map: Record<string, string> = {
    GET: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    PATCH: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return map[method] || "bg-gray-100";
}

export default function HistoryItem({
  item,
  onDelete
}: {
  item: ApiHistory;
  onDelete: (id: string) => void;
}) {
  const dispatch = useDispatch<AppDispatch>()
  console.log('item',item);

  return (
    <div className="group rounded-xl border border-gray-200 dark:border-gray-800 p-2 transition hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
      onClick={() => {
        dispatch(addTabFromHistory(item))
      }}>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <span
              className={`px-2.5 py-1 rounded-full text-sm font-semibold ${methodBadge(
                item.method
              )}`}
            >
              {item.method}
            </span>

            <span
              className={`flex items-center gap-1 text-sm font-medium ${item.statusCode < 400
                ? "text-green-600 dark:text-green-400"
                : "text-red-500"
                }`}
            >
              {item.statusCode < 400 ? (
                <CheckCircleIcon className="w-4 h-4" />
              ) : (
                <ExclamationCircleIcon className="w-4 h-4" />
              )}
              {item.statusCode}
            </span>
            {/* 
            <span className="text-sm opacity-60">
              {item.responseTime}ms
            </span> */}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <LinkIcon className="w-4 h-4 opacity-50 shrink-0" />
            <Tooltip content={item.url}>
              <p className="truncate text-sm font-medium">
                {item.url}
              </p>
            </Tooltip>
          </div>
        </div>

        <div className="text-sm opacity-60 shrink-0 flex items-center gap-2 min-w-0">
          {formatTime(item.createdAt)}
          <TrashIcon className="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item._id);
            }}
          />
        </div>
      </div>
    </div>
  );
}
