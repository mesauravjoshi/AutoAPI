import { useRef, useState, useCallback } from "react";
import { GripVertical, Trash2, Plus, File as FileIcon, X } from "lucide-react";
import Checkbox from "@/components/UI/Common/Checkbox";
import type { BodyEditorProps, BodyTypeConfig } from ".";

/* ------------------------------------------------------------------ */
/* Self-contained: row shape, row-table CRUD/drag logic, editor UI,   */
/* and serializer all live in this one file. Nothing outside this     */
/* file needs to know how form-data rows work internally.             */
/* ------------------------------------------------------------------ */

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

const isRowEmpty = (r: FormDataRow) => !r.key && !r.value && !r.file;

const dragRowClasses = (isDragging: boolean, isOver: boolean, enabled: boolean) =>
  `group grid items-center gap-2 px-2 py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-700/70 transition-colors duration-150 ${isDragging ? "opacity-40" : ""
  } ${isOver ? "border-t-2 border-t-indigo-500" : ""} ${!enabled ? "bg-gray-50/50 dark:bg-gray-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
  }`;

function useRowsController(rows: FormDataRow[], onChange: (rows: FormDataRow[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const updateRow = useCallback(
    (id: string, patch: Partial<FormDataRow>) => {
      const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
      const last = next[next.length - 1];
      if (!isRowEmpty(last)) next.push(createFormDataRow());
      onChange(next);
    },
    [rows, onChange]
  );

  const deleteRow = useCallback(
    (id: string) => {
      const next = rows.filter((r) => r.id !== id);
      onChange(next.length ? next : [createFormDataRow()]);
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
/* Serializer — this is what makes empty-body handling correct.       */
/* forEach() below simply never appends rows with no key, so an       */
/* untouched table naturally produces `new FormData()` with zero      */
/* entries — a valid, empty multipart body, never an empty string.    */
/* ------------------------------------------------------------------ */

function serializeFormData(rows: FormDataRow[]): FormData {

  const fd = new FormData();
  rows.forEach((r) => {
    // console.log(r.key, r.value);
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
    useRowsController(value, onChange);
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
                <Checkbox
                  checked={row.enabled}
                  onChange={(checked) => updateRow(row.id, { enabled: checked })}
                  disabled={isLast && isEmpty}
                  className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600"
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
                    ref={(el) => {
                      fileInputs.current[row.id] = el;
                    }}
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

export const formDataConfig: BodyTypeConfig<FormDataRow[]> = {
  id: "form-data",
  label: "form-data",
  hint: "Send fields and files as multipart/form-data.",
  createInitialValue: () => [createFormDataRow()],
  serialize: serializeFormData,
  Editor: FormDataEditor,
  getContentType: () => null,
};