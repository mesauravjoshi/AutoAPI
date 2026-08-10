// BodyWidget.tsx
import { useState, useEffect } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";

interface BodyWidgetProps {
  body: string;
  setBody: (body: string) => void;
}

type BodyType = "form-data" | "x-www-form-urlencoded" | "raw";

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

const createRow = (): KeyValueRow => ({
  id: crypto.randomUUID(),
  key: "",
  value: "",
  enabled: true,
});

const BODY_TYPES: { id: BodyType; label: string; hint: string }[] = [
  { id: "form-data", label: "form-data", hint: "Send fields and files as multipart/form-data." },
  { id: "x-www-form-urlencoded", label: "x-www-form-urlencoded", hint: "Send simple key-value pairs, URL-encoded." },
  { id: "raw", label: "raw", hint: "Send a raw payload — JSON, XML, text, anything." },
];

function serializeRows(rows: KeyValueRow[], type: BodyType): string {
  const active = rows.filter((r) => r.enabled && (r.key || r.value));
  if (type === "x-www-form-urlencoded") {
    return active.map((r) => `${encodeURIComponent(r.key)}=${encodeURIComponent(r.value)}`).join("&");
  }
  return active.map((r) => `${r.key}: ${r.value}`).join("\n");
}

export default function BodyWidget({ body, setBody }: BodyWidgetProps) {
  const [bodyType, setBodyType] = useState<BodyType>("raw");
  const [formDataRows, setFormDataRows] = useState<KeyValueRow[]>([createRow()]);
  const [urlencodedRows, setUrlencodedRows] = useState<KeyValueRow[]>([createRow()]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const active = BODY_TYPES.find((t) => t.id === bodyType)!;
  const rows = bodyType === "form-data" ? formDataRows : urlencodedRows;
  const setRows = bodyType === "form-data" ? setFormDataRows : setUrlencodedRows;

  // keep parent body string in sync with the active table
  useEffect(() => {
    if (bodyType === "raw") return;
    setBody(serializeRows(rows, bodyType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, bodyType]);

  const updateRow = (id: string, patch: Partial<KeyValueRow>) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      const last = next[next.length - 1];
      if (last.key || last.value) next.push(createRow()); // auto-add a fresh row
      return next;
    });
  };

  const deleteRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length ? next : [createRow()];
    });
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    setRows((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="w-full">
      {/* Segmented control */}
      <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-700">
        {BODY_TYPES.map((type) => {
          const isActive = bodyType === type.id;
          return (
            <label
              key={type.id}
              className={`relative cursor-pointer select-none rounded-md px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 ${isActive
                  ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
            >
              <input
                type="radio"
                name="body-type"
                value={type.id}
                checked={isActive}
                onChange={() => setBodyType(type.id)}
                className="sr-only"
              />
              {type.label}
            </label>
          );
        })}
      </div>

      <p className="mt-1.5 mb-3 text-xs text-gray-400 dark:text-gray-500">{active.hint}</p>

      {bodyType === "raw" ? (
        <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 focus-within:border-transparent transition-all duration-200 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">raw</span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">{body.length} chars</span>
          </div>
          <textarea
            rows={6}
            className="block w-full resize-y bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none font-mono leading-relaxed transition-colors"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{
              "key": "value"
            }'
          />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[28px_28px_1fr_1fr_32px] items-center gap-2 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <span />
            <span />
            <span>Key</span>
            <span>Value</span>
            <span />
          </div>

          <div>
            {rows.map((row, index) => {
              const isLast = index === rows.length - 1;
              const isEmpty = !row.key && !row.value;
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
                  onDragLeave={() => setOverIndex((prev) => (prev === index ? null : prev))}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className={`group grid grid-cols-[28px_28px_1fr_1fr_32px] items-center gap-2 px-2 py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-700/70 transition-colors duration-150 ${isDragging ? "opacity-40" : ""
                    } ${isOver ? "border-t-2 border-t-indigo-500" : ""} ${!row.enabled ? "bg-gray-50/50 dark:bg-gray-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    }`}
                >
                  {/* Drag handle */}
                  <span
                    className={`flex items-center justify-center h-full text-gray-300 dark:text-gray-600 ${isLast && isEmpty
                        ? "invisible"
                        : "cursor-grab active:cursor-grabbing hover:text-gray-500 dark:hover:text-gray-400"
                      }`}
                  >
                    <GripVertical size={14} />
                  </span>

                  {/* Select / enable row */}
                  <span className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => updateRow(row.id, { enabled: e.target.checked })}
                      disabled={isLast && isEmpty}
                      className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 accent-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 disabled:opacity-30"
                    />
                  </span>

                  {/* Key */}
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => updateRow(row.id, { key: e.target.value })}
                    placeholder="Key"
                    className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none rounded ${!row.enabled ? "text-gray-400 dark:text-gray-500 line-through decoration-gray-300" : ""
                      }`}
                  />

                  {/* Value */}
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(row.id, { value: e.target.value })}
                    placeholder="Value"
                    className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none rounded ${!row.enabled ? "text-gray-400 dark:text-gray-500 line-through decoration-gray-300" : ""
                      }`}
                  />

                  {/* Delete */}
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

          {/* Add row */}
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, createRow()])}
            className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 border-t border-gray-100 dark:border-gray-700 transition-colors duration-150"
          >
            <Plus size={13} />
            Add row
          </button>
        </div>
      )}
    </div>
  );
}