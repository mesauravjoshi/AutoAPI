import { ReactNode } from 'react';
import {
  Cookie as CookieIcon,
} from 'lucide-react';
// import { DisplayResponse, Headers } from '@/types/types';
// import { Button } from "@/components/UI/button";

interface ParsedCookie {
  name: string;
  value: string;
  attrs: string[];
}

/* ---------- Cookies panel ---------- */

export default function CookiesPanel({ cookies }: { cookies: ParsedCookie[] }) {
  if (cookies.length === 0) {
    return <EmptyPanelState icon={<CookieIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />} label="No cookies were set by this response." />;
  }
  return (
    <div className="max-h-[50vh] overflow-auto p-4 space-y-2.5">
      {cookies.map((cookie, i) => (
        <div
          key={`${cookie.name}-${i}`}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3"
        >
          <div className="text-xs font-mono">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{cookie.name}</span>
            <span className="text-gray-400 dark:text-gray-500"> = </span>
            <span className="text-gray-600 dark:text-gray-300 break-all">{cookie.value}</span>
          </div>
          {cookie.attrs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {cookie.attrs.map((attr, j) => (
                <span
                  key={j}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  {attr}
                </span>
              ))}
            </div>
          )}
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