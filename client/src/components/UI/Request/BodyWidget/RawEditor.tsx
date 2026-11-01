import { useMemo } from "react";
import type { BodyEditorProps } from "./index";
import type { RawValue, RawContentType } from "./Raw";

const PLACEHOLDERS: Record<RawContentType, string> = {
  json: '{\n  "key": "value"\n}',
  javascript: '// sent as plain text — Content-Type: application/javascript\nfunction handler() {\n  return true;\n}',
  text: "Plain text body",
};

/* ------------------------------------------------------------------ */
/* Editor                                                               */
/* ------------------------------------------------------------------ */

export default function RawEditor({ value, onChange }: BodyEditorProps<RawValue>) {
  const isJson = value.type === "json";

  const jsonError = useMemo(() => {
    if (!isJson || value.content.trim() === "") return null;
    try {
      JSON.parse(value.content);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid JSON";
    }
  }, [isJson, value.content]);

  return (
    <div
      className={`rounded-lg border ${jsonError ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"
        } bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 focus-within:border-transparent transition-all duration-200 overflow-hidden`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {value.type} joshi
        </span>
        <div className="flex items-center gap-2">
          {jsonError && (
            <span className="text-[11px] font-medium text-red-500 dark:text-red-400">Invalid JSON</span>
          )}
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{value.content.length} chars</span>
        </div>
      </div>

      <textarea
        rows={6}
        spellCheck={false}
        className="block w-full resize-y bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none font-mono leading-relaxed transition-colors"
        value={value.content}
        onChange={(e) => onChange({ ...value, content: e.target.value })}
        placeholder={PLACEHOLDERS[value.type]}
      />
    </div>
  );
}
