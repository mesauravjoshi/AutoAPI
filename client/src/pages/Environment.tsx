import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, KeyRound, Check } from "lucide-react";

// ---------------------------------------------------------------------------
// Storage: real localStorage in a normal app. Wrapped in try/catch with an
// in-memory fallback so the component still works in sandboxed previews
// where localStorage access can throw.
// ---------------------------------------------------------------------------
const STORAGE_KEY = "env-variables";
let memoryFallback: string | null = null;

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryFallback;
  }
}

function writeStorage(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    memoryFallback = value;
  }
}

interface EnvRow {
  id: string;
  variable: string;
  value: string;
}

const makeId = () => Math.random().toString(36).slice(2, 10);

const seedRows: EnvRow[] = [
  // { id: makeId(), variable: "DATABASE_URL", value: "postgres://localhost:5432/app" },
  // { id: makeId(), variable: "", value: "" },
];

export default function EnvironmentPage() {
  const [rows, setRows] = useState<EnvRow[]>(() => {
    const saved = readStorage();
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EnvRow[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore malformed data, fall back to seed rows
      }
    }
    return seedRows;
  });

  const [savedPulse, setSavedPulse] = useState(false);
  const isFirstRun = useRef(true);

  // Autosave whenever rows change.
  useEffect(() => {
    writeStorage(JSON.stringify(rows));

    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setSavedPulse(true);
    const t = setTimeout(() => setSavedPulse(false), 1000);
    return () => clearTimeout(t);
  }, [rows]);

  const updateRow = (id: string, field: "variable" | "value", next: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: next } : r)));
  };

  const addRow = () => {
    const id = makeId();
    setRows((prev) => [...prev, { id, variable: "", value: "" }]);
    // focus the new row's variable input on next tick
    setTimeout(() => {
      document.getElementById(`var-${id}`)?.focus();
    }, 0);
  };

  const deleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const filledCount = rows.filter((r) => r.variable.trim() && r.value.trim()).length;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <KeyRound size={18} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">Environment</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Variables load automatically at runtime. Saved on this device.
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity duration-300 ${
              savedPulse ? "opacity-100" : "opacity-0"
            } bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400`}
          >
            <Check size={13} strokeWidth={2.5} />
            Saved
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr_40px] gap-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Variable
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 pl-4">
              Value
            </span>
            <span />
          </div>

          {/* Rows */}
          <div>
            {rows.length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No variables yet.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add a row to get started.</p>
              </div>
            )}

            {rows.map((row, idx) => (
              <div
                key={row.id}
                className={`grid grid-cols-[1fr_1fr_40px] items-center gap-0 px-4 py-2 ${
                  idx !== rows.length - 1 ? "border-b border-gray-100 dark:border-gray-700/50" : ""
                }`}
              >
                <input
                  id={`var-${row.id}`}
                  value={row.variable}
                  onChange={(e) =>
                    updateRow(row.id, "variable", e.target.value.toUpperCase().replace(/\s+/g, "_"))
                  }
                  placeholder="VARIABLE_NAME"
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-[13px] text-cyan-600 dark:text-cyan-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none py-1.5 pr-4 rounded focus:bg-gray-50 dark:focus:bg-gray-700/40"
                />
                <input
                  value={row.value}
                  onChange={(e) => updateRow(row.id, "value", e.target.value)}
                  placeholder="value"
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-[13px] text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none py-1.5 pl-4 rounded focus:bg-gray-50 dark:focus:bg-gray-700/40"
                />
                <button
                  onClick={() => deleteRow(row.id)}
                  aria-label="Delete variable"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>

          {/* Add row */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <Plus size={15} strokeWidth={2} />
              Add row
            </button>
          </div>
        </div>

        {/* Footer count */}
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          {filledCount} of {rows.length} variable{rows.length === 1 ? "" : "s"} set
        </p>
      </div>
    </div>
  );
}