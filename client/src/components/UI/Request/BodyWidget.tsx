// BodyWidget.tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { GripVertical, Trash2, Plus, File as FileIcon, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared contracts — every body type editor implements this shape.   */
/* Adding a new body type never touches this file's control flow,     */
/* only adds one config entry + one Editor component.                 */
/* ------------------------------------------------------------------ */

type BodyType = "form-data" | "x-www-form-urlencoded" | "raw";

interface BodyEditorProps<T> {
  value: T;
  onChange: (value: T) => void;
}

interface BodyTypeConfig<T = any> {
  id: BodyType;
  label: string;
  hint: string;
  createInitialValue: (initialBody?: string | FormData) => T;
  serialize: (value: T) => string | FormData;
  Editor: React.ComponentType<BodyEditorProps<T>>;
}

interface BodyWidgetProps {
  body: string | FormData;
  setBody: (body: string | FormData) => void;
}

/* ------------------------------------------------------------------ */
/* Shared row-list controller (add/update/delete/drag) — reused by    */
/* any body type that's a key-value table (form-data, urlencoded, and */
/* whatever tabular type gets added next).                            */
/* ------------------------------------------------------------------ */

function useRowsController<T extends { id: string }>(
  rows: T[],
  onChange: (rows: T[]) => void,
  createRow: () => T,
  isRowEmpty: (row: T) => boolean
) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const updateRow = useCallback(
    (id: string, patch: Partial<T>) => {
      const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
      const last = next[next.length - 1];
      if (!isRowEmpty(last)) next.push(createRow());
      onChange(next);
    },
    [rows, onChange, createRow, isRowEmpty]
  );

  const deleteRow = useCallback(
    (id: string) => {
      const next = rows.filter((r) => r.id !== id);
      onChange(next.length ? next : [createRow()]);
    },
    [rows, onChange, createRow]
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

const dragRowClasses = (isDragging: boolean, isOver: boolean, enabled: boolean) =>
  `group grid items-center gap-2 px-2 py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-700/70 transition-colors duration-150 ${isDragging ? "opacity-40" : ""
  } ${isOver ? "border-t-2 border-t-indigo-500" : ""} ${!enabled ? "bg-gray-50/50 dark:bg-gray-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
  }`;

/* ================================================================== */
/* form-data                                                           */
/* ================================================================== */

interface FormDataRow {
  id: string;
  key: string;
  type: "text" | "file";
  value: string;
  file: File | null;
  enabled: boolean;
}

const createFormDataRow = (): FormDataRow => ({
  id: crypto.randomUUID(),
  key: "",
  type: "text",
  value: "",
  file: null,
  enabled: true,
});

const isFormDataRowEmpty = (r: FormDataRow) => !r.key && !r.value && !r.file;

function serializeFormData(rows: FormDataRow[]): FormData {
  const fd = new FormData();
  rows.forEach((r) => {
    if (!r.enabled || !r.key) return;
    if (r.type === "file") {
      if (r.file) fd.append(r.key, r.file, r.file.name);
    } else {
      fd.append(r.key, r.value);
    }
  });
  return fd;
}

function FormDataEditor({ value, onChange }: BodyEditorProps<FormDataRow[]>) {
  const { dragIndex, overIndex, setDragIndex, setOverIndex, updateRow, deleteRow, handleDrop } =
    useRowsController(value, onChange, createFormDataRow, isFormDataRowEmpty);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="grid grid-cols-[28px_28px_1fr_86px_1fr_32px] items-center gap-2 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        <span />
        <span />
        <span>Key</span>
        <span>Type</span>
        <span>Value</span>
        <span />
      </div>

      <div>
        {value.map((row, index) => {
          const isLast = index === value.length - 1;
          const isEmpty = isFormDataRowEmpty(row);
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
              className={`${dragRowClasses(isDragging, isOver, row.enabled)} grid-cols-[28px_28px_1fr_86px_1fr_32px]`}
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

              {/* Enable */}
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

              {/* Type selector — form-data only */}
              <select
                value={row.type}
                onChange={(e) => {
                  const nextType = e.target.value as "text" | "file";
                  updateRow(row.id, { type: nextType, value: "", file: null });
                }}
                disabled={isLast && isEmpty}
                className="w-full bg-transparent px-1.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-30 cursor-pointer"
              >
                <option value="text">Text</option>
                <option value="file">File</option>
              </select>

              {/* Value: text input OR file picker */}
              {row.type === "file" ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <input
                    ref={(el) => { fileInputs.current[row.id] = el; }}
                    type="file"
                    className="hidden"
                    onChange={(e) => updateRow(row.id, { file: e.target.files?.[0] ?? null })}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputs.current[row.id]?.click()}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors min-w-0"
                  >
                    <FileIcon size={12} className="shrink-0" />
                    <span className="truncate max-w-27.5">{row.file ? row.file.name : "Select file"}</span>
                  </button>
                  {row.file && (
                    <button
                      type="button"
                      onClick={() => updateRow(row.id, { file: null })}
                      className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 shrink-0"
                      aria-label="Clear file"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                  placeholder="Value"
                  className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none rounded ${!row.enabled ? "text-gray-400 dark:text-gray-500 line-through decoration-gray-300" : ""
                    }`}
                />
              )}

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

      <button
        type="button"
        onClick={() => onChange([...value, createFormDataRow()])}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 border-t border-gray-100 dark:border-gray-700 transition-colors duration-150"
      >
        <Plus size={13} />
        Add row
      </button>
    </div>
  );
}

/* ================================================================== */
/* x-www-form-urlencoded                                               */
/* ================================================================== */

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

const isUrlEncodedRowEmpty = (r: UrlEncodedRow) => !r.key && !r.value;

function serializeUrlEncoded(rows: UrlEncodedRow[]): string {
  const params = new URLSearchParams();
  rows.filter((r) => r.enabled && r.key).forEach((r) => params.append(r.key, r.value));
  return params.toString();
}

function UrlEncodedEditor({ value, onChange }: BodyEditorProps<UrlEncodedRow[]>) {
  const { dragIndex, overIndex, setDragIndex, setOverIndex, updateRow, deleteRow, handleDrop } =
    useRowsController(value, onChange, createUrlEncodedRow, isUrlEncodedRowEmpty);

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
          const isEmpty = isUrlEncodedRowEmpty(row);
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
                className={`flex items-center justify-center h-full text-gray-300 dark:text-gray-600 ${isLast && isEmpty
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
                className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none rounded ${!row.enabled ? "text-gray-400 dark:text-gray-500 line-through decoration-gray-300" : ""
                  }`}
              />

              <input
                type="text"
                value={row.value}
                onChange={(e) => updateRow(row.id, { value: e.target.value })}
                placeholder="Value"
                className={`w-full bg-transparent px-1.5 py-1 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none rounded ${!row.enabled ? "text-gray-400 dark:text-gray-500 line-through decoration-gray-300" : ""
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

/* ================================================================== */
/* raw                                                                  */
/* ================================================================== */

function RawEditor({ value, onChange }: BodyEditorProps<string>) {
  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 focus-within:border-transparent transition-all duration-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">raw</span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">{value.length} chars</span>
      </div>
      <textarea
        rows={6}
        className="block w-full resize-y bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none font-mono leading-relaxed transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{
  "key": "value"
}'
      />
    </div>
  );
}

/* ================================================================== */
/* Registry — the ONLY place that needs to change to add a new type.  */
/* To add a body type: write its row/value type + Editor component    */
/* above, then add one entry here. No branching logic anywhere else.  */
/* ================================================================== */

const BODY_TYPE_CONFIGS: BodyTypeConfig[] = [
  {
    id: "form-data",
    label: "form-data",
    hint: "Send fields and files as multipart/form-data.",
    createInitialValue: () => [createFormDataRow()],
    serialize: serializeFormData,
    Editor: FormDataEditor,
  },
  {
    id: "x-www-form-urlencoded",
    label: "x-www-form-urlencoded",
    hint: "Send simple key-value pairs, URL-encoded.",
    createInitialValue: () => [createUrlEncodedRow()],
    serialize: serializeUrlEncoded,
    Editor: UrlEncodedEditor,
  },
  {
    id: "raw",
    label: "raw",
    hint: "Send a raw payload — JSON, XML, text, anything.",
    createInitialValue: (initialBody) => (typeof initialBody === "string" ? initialBody : ""),
    serialize: (v: string) => v,
    Editor: RawEditor,
  },
];

/* ================================================================== */
/* BodyWidget — orchestrator only. No per-type conditionals.          */
/* ================================================================== */

export default function BodyWidget({ body, setBody }: BodyWidgetProps) {
  const [bodyType, setBodyType] = useState<BodyType>("raw");

  // one independent value slot per body type, so switching tabs never
  // discards what you typed in another tab
  const [store, setStore] = useState<Record<BodyType, unknown>>(() =>
    Object.fromEntries(
      BODY_TYPE_CONFIGS.map((c) => [c.id, c.createInitialValue(body)])
    ) as Record<BodyType, unknown>
  );

  const config = BODY_TYPE_CONFIGS.find((c) => c.id === bodyType)!;
  const value = store[bodyType];

  const handleChange = useCallback(
    (next: unknown) => setStore((prev) => ({ ...prev, [bodyType]: next })),
    [bodyType]
  );

  // push the serialized, request-ready value up to the parent
  useEffect(() => {
    setBody(config.serialize(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, bodyType]);

  const Editor = config.Editor;

  return (
    <div className="w-full overflow-auto min-h-45.5 max-h-45.5">
      {/* Segmented control — generated from the registry */}
      <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-700 mt-2">
        {BODY_TYPE_CONFIGS.map((c) => {
          const isActive = bodyType === c.id;
          return (
            <label
              key={c.id}
              className={`relative cursor-pointer select-none rounded-md px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 ${isActive
                  ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
            >
              <input
                type="radio"
                name="body-type"
                value={c.id}
                checked={isActive}
                onChange={() => setBodyType(c.id)}
                className="sr-only"
              />
              {c.label}
            </label>
          );
        })}
      </div>

      <p className="mt-1.5 mb-3 text-xs text-gray-400 dark:text-gray-500">{config.hint}</p>

      <div className="mx-1">
        <Editor value={value} onChange={handleChange} />
      </div>
    </div>
  );
}