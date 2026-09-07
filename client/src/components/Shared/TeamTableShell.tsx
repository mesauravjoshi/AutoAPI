import { Loader2Icon } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  headers: string[];
  loading: boolean;
  isEmpty: boolean;
  emptyLabel: string;
  loadingLabel: string;
  children: ReactNode;
}

export default function TeamTableShell({
  headers,
  loading,
  isEmpty,
  emptyLabel,
  loadingLabel,
  children,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 dark:text-gray-500 first:pl-5 last:pr-5"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                  <Loader2Icon size={15} className="animate-spin" />
                  {loadingLabel}
                </div>
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-10 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</p>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}