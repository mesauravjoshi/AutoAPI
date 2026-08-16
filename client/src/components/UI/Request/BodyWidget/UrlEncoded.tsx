import { useState, useCallback } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";
import type { BodyEditorProps, BodyTypeConfig } from ".";

/* Self-contained, same as FormData.tsx — deliberately not sharing the
   row-table hook with FormData.tsx so this file has zero cross-editor
   coupling and works as a standalone template for the next type. */

interface UrlEncodedRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

const createUrlEncodedRow = (): UrlEncodedRow => ({
  id: crypto.randomUUID(),
  key: "",
  value: "",
  enabled: true,
});

const isRowEmpty = (r: UrlEncodedRow) => !r.key && !r.value;

const dragRowClasses = (isDragging: boolean, isOver: boolean, enabled: boolean) =>
  `group grid items-center gap-2 px-2 py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-700/70 transition-colors duration-150 ${
    isDragging ? "opacity-40" : ""
  } ${isOver ? "border-t-2 border-t-indigo-500" : ""} ${
    !enabled ? "bg-gray-50/50 dark:bg-gray-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
  }`;

function useRowsController(rows: UrlEncodedRow[], onChange: (rows: UrlEncodedRow[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const updateRow = useCallback(
    (id: string, patch: Partial<UrlEncodedRow>) => {
      const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
      const last = next[next.length - 1];
      if (!isRowEmpty(last)) next.push(createUrlEncodedRow());
      onChange(next);
    },
    [rows, onChange]
  );

  const deleteRow = useCallback(
    (id: string) => {
      const next = rows.filter((r) => r.id !== id);
      onChange(next.length ? next : [createUrlEncodedRow()]);
    },
    [rows, onChange]
  );

  const handleDrop = useCallback(
    (dropIndex: number) => {
      if (dragIndex === null || dragIndex === dropIndex) {
        setDragIndex(null);
        setOverIndex(null);
        return;
      }
      const next = [...rows];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      onChange(next);
      setDragIndex(null);
      setOverIndex(null);
    },
    [rows, onChange, dragIndex]
  );

  return { dragIndex, overIndex, setDragIndex, setOverIndex, updateRow, deleteRow, handleDrop };
}

/* ------------------------------------------------------------------ */
/* Serializer — returns a URLSearchParams INSTANCE, not `.toString()`. */
/* axios/fetch both recognize URLSearchParams as `data`/`body` and    */
/* set the correct Content-Type automatically. An untouched table     */
/* naturally produces `new URLSearchParams()` with zero pairs — a     */
/* valid, empty urlencoded body, never an empty string.                */
/* ------------------------------------------------------------------ */

function serializeUrlEncoded(rows: UrlEncodedRow[]): URLSearchParams {
  const params = new URLSearchParams();
  rows.filter((r) => r.enabled && r.key).forEach((r) => params.append(r.key, r.value));
  return params;
}

function UrlEncodedEditor({ value, onChange }: BodyEditorProps<UrlEncodedRow[]>) {
  const { dragIndex, overIndex, setDragIndex, setOverIndex, updateRow, deleteRow, handleDrop } =
    useRowsController(value, onChange);

  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="grid grid-cols-[28px_28px_1fr_1fr_32px] items-center gap-2 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        <span />
        <span />
        <span>Key</span>
        <span>Value</span>
        <span />
      </div>

      <div>
        {value.map((row, index) => {
          const isLast = index === value.length - 1;
          const isEmpty = isRowEmpty(row);
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <div
              key={row.id}
              draggable={!isLast || !isEmpty}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== index) setOverIndex(index);
              }}
              onDragLeave={() => setOverIndex((p) => (p === index ? null : p))}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`${dragRowClasses(isDragging, isOver, row.enabled)} grid-cols-[28px_28px_1fr_1fr_32px]`}
            >
              <span
                className={`flex items-center justify-center h-full text-gray-300 dark:text-gray-600 ${
                  isLast && isEmpty
                    ? "invisible"
                    : "cursor-grab active:cursor-grabbing hover:text-gray-500 dark:hover:text-gray-400"
                }`}
              >
                <GripVertical size={14} />
              </span>

              <span className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) => updateRow(row.id, { enabled: e.target.checked })}
                  disabled={isLast && isEmpty}
                  className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 disabled:opacity-30"
                />
              </span>

              <input
                type="text"
                value={row.key}
                onChange={(e) => updateRow(row.id, { key: e.target.value })}
                placeholder="Key"
                className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none rounded ${
                  !row.enabled ? "text-gray-400 dark:text-gray-500 line-through decoration-gray-300" : ""
                }`}
              />

              <input
                type="text"
                value={row.value}
                onChange={(e) => updateRow(row.id, { value: e.target.value })}
                placeholder="Value"
                className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none rounded ${
                  !row.enabled ? "text-gray-400 dark:text-gray-500 line-through decoration-gray-300" : ""
                }`}
              />

              <span className="flex items-center justify-center">
                {!(isLast && isEmpty) && (
                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-all duration-150"
                    aria-label="Delete row"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange([...value, createUrlEncodedRow()])}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 border-t border-gray-100 dark:border-gray-700 transition-colors duration-150"
      >
        <Plus size={13} />
        Add row
      </button>
    </div>
  );
}

export const urlEncodedConfig: BodyTypeConfig<UrlEncodedRow[]> = {
  id: "x-www-form-urlencoded",
  label: "x-www-form-urlencoded",
  hint: "Send simple key-value pairs, URL-encoded.",
  createInitialValue: () => [createUrlEncodedRow()],
  serialize: serializeUrlEncoded,
  Editor: UrlEncodedEditor,
};