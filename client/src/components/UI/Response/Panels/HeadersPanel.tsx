import { ReactNode } from 'react';
import {
  Inbox,
} from 'lucide-react';


/* ---------- Headers panel ---------- */
export default function HeadersPanel({ entries }: { entries: [string, string][] }) {
  if (entries.length === 0) {
    return <EmptyPanelState icon={<Inbox className="w-6 h-6 text-gray-300 dark:text-gray-600" />} label="No headers returned for this response." />;
  }
  return (
    <div className="max-h-[50vh] overflow-auto">
      {entries.map(([key, value], i) => (
        <div
          key={`${key}-${i}`}
          className="flex items-start gap-4 px-5 py-2.5 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="w-48 shrink-0 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 pt-0.5">{key}</span>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyPanelState({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 px-5 text-center">
      {icon}
      <p className="text-gray-400 dark:text-gray-500 text-xs">{label}</p>
    </div>
  );
}