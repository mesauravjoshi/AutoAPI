// HeaderWidget.tsx
import { useEffect, useState } from 'react';
import { Trash2, Plus, Lock } from 'lucide-react';
import { HeaderItem } from '@/types/types';
import Checkbox from '@/components/UI/Common/Checkbox';

interface HeaderWidgetProps {
  header: HeaderItem[];
  setHeader: React.Dispatch<React.SetStateAction<HeaderItem[]>>;
}

const DEFAULT_HEADERS: { key: string; value: string }[] = [
  { key: 'Connection', value: 'keep-alive' },
  { key: 'Accept', value: '*/*' },
];

const createHeaderRow = (overrides: Partial<HeaderItem> = {}): HeaderItem => ({
  id: crypto.randomUUID(),
  key: '',
  value: '',
  enabled: true,
  source: 'user',
  ...overrides,
});

const HeaderWidget: React.FC<HeaderWidgetProps> = ({ header, setHeader }) => {
  const [showAuto, setShowAuto] = useState(false);

  // seed the two default headers once, idempotently — safe to run every
  // time this widget mounts (e.g. re-visiting the Header tab) since it
  // only adds what's missing, by key, never duplicates
  useEffect(() => {
    setHeader((prev) => {
      const existingKeys = new Set(prev.map((h) => h.key.toLowerCase()));
      const missing = DEFAULT_HEADERS.filter((d) => !existingKeys.has(d.key.toLowerCase()));
      if (!missing.length) return prev;
      const seeded = missing.map((d) => createHeaderRow({ key: d.key, value: d.value, source: 'default' }));
      return [...seeded, ...prev];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeader((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const toggleHeader = (id: string, enabled: boolean) => {
    setHeader((prev) => prev.map((h) => (h.id === id ? { ...h, enabled } : h)));
  };

  const removeHeaderRow = (id: string) => {
    setHeader((prev) => prev.filter((h) => h.id !== id));
  };

  const autoHeaders = header.filter((h) => h.source === 'default' || h.source === 'auth');
  const visibleHeaders = header.filter((h) => h.source === 'user' || showAuto);

  return (
    <div className="mt-2 min-h-45.5 max-h-45.5 flex flex-col">
      {/* Filter toggle */}
      <div className="px-1 pb-2 shrink-0">
        <Checkbox
          label="Show auto-generated headers"
          checked={showAuto}
          onChange={(checked) => setShowAuto(checked)}
        />
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[28px_1fr_1fr_32px] items-center gap-2 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">
          <span />
          <span>Key</span>
          <span>Value</span>
          <span />
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleHeaders.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
              {autoHeaders.length > 0 && !showAuto
                ? `No custom headers yet. ${autoHeaders.length} auto-generated header${autoHeaders.length > 1 ? 's' : ''} hidden.`
                : 'No headers yet.'}
            </div>
          ) : (
            visibleHeaders.map((item) => {
              const isLocked = item.source === 'default' || item.source === 'auth';
              const isAuthRow = item.source === 'auth';

              return (
                <div
                  key={item.id}
                  className={`group grid grid-cols-[28px_1fr_1fr_32px] items-center gap-2 px-2 py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-700/70 transition-colors duration-150 ${!item.enabled
                    ? 'bg-gray-50/50 dark:bg-gray-900/30'
                    : isLocked
                      ? 'bg-gray-50/30 dark:bg-gray-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                >
                  {/* Enable/disable — stays interactive even for locked rows,
                      so you can exclude an auto header without unlocking it */}
                  <span className="flex items-center justify-center">
                    <div className="px-1 pb-2 shrink-0">
                      <Checkbox
                        checked={item.enabled}
                        onChange={(checked) => toggleHeader(item.id, checked)}
                      />
                    </div>
                  </span>

                  {/* Key */}
                  <input
                    type="text"
                    value={item.key}
                    onChange={(e) => updateHeader(item.id, 'key', e.target.value)}
                    placeholder="Key"
                    disabled={isLocked}
                    className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono focus:outline-none rounded ${isLocked
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : !item.enabled
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-white'
                      }`}
                  />

                  {/* Value — password type masks it for the auth row only */}
                  <input
                    type={isAuthRow ? 'password' : 'text'}
                    value={item.value}
                    onChange={(e) => updateHeader(item.id, 'value', e.target.value)}
                    placeholder="Value"
                    disabled={isLocked}
                    className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono focus:outline-none rounded ${isLocked
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : !item.enabled
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-white'
                      }`}
                  />

                  {/* Delete — replaced with a lock icon for auto rows */}
                  <span className="flex items-center justify-center">
                    {isLocked ? (
                      <span title={isAuthRow ? 'Managed by the Authentication tab' : 'Added automatically'}>
                        <Lock size={13} className="text-gray-300 dark:text-gray-600" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeHeaderRow(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-all duration-150"
                        aria-label="Delete header"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => setHeader((prev) => [...prev, createHeaderRow()])}
          className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 border-t border-gray-100 dark:border-gray-700 transition-colors duration-150 shrink-0"
        >
          <Plus size={13} />
          Add Header
        </button>
      </div>
    </div>
  );
};

export default HeaderWidget;