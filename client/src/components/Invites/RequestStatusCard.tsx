import { MyRequest } from "@/types/team.type";

const STATUS_STYLES: Record<MyRequest["status"], string> = {
  requested: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

const STATUS_LABEL: Record<MyRequest["status"], string> = {
  requested: "Pending",
  rejected: "Rejected",
};

export default function RequestStatusCard({ request }: { request: MyRequest }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {request.workspaceId.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Requested on {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>

      <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[request.status]}`}>
        {STATUS_LABEL[request.status]}
      </span>
    </div>
  );
}