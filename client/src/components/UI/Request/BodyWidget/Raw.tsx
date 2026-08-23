import { useMemo } from "react";
import type { BodyEditorProps, BodyTypeConfig, SerializedBody } from "./index";
import CustomSelect, { SelectOption } from "@/components/UI/Customselect"; // adjust path to wherever CustomSelect actually lives

export type RawContentType = "text" | "javascript" | "json";

export interface RawValue {
  content: string;
  type: RawContentType;
}

const RAW_TYPE_OPTIONS: SelectOption<RawContentType>[] = [
  { value: "text", label: "Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
];

const PLACEHOLDERS: Record<RawContentType, string> = {
  json: '{\n  "key": "value"\n}',
  javascript: '// sent as plain text — Content-Type: application/javascript\nfunction handler() {\n  return true;\n}',
  text: "Plain text body",
};

/* ------------------------------------------------------------------ */
/* Toolbar — the raw-type dropdown, styled to match the segmented      */
/* control's pill: same height/padding/text size, indigo "active"      */
/* treatment, so it reads as one connected control rather than a       */
/* bolted-on <select>.                                                 */
/* ------------------------------------------------------------------ */

function RawToolbar({ value, onChange }: BodyEditorProps<RawValue>) {
  return (
    <CustomSelect<RawContentType>
      options={RAW_TYPE_OPTIONS}
      value={value.type}
      onChange={(type) => onChange({ ...value, type })}
      wrapperClassName="shrink-0"
      buttonClassName="min-w-[104px] justify-between rounded-md border px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 shadow-sm"
      buttonClosedClassName="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20 hover:border-gray-300 dark:hover:border-gray-600"
      buttonOpenClassName="bg-white dark:bg-gray-700 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-300"
      chevronClassName="text-indigo-400 dark:text-indigo-300"
      dropdownClassName="top-9 right-0 w-32 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden"
      optionClassName="px-3 py-1.5 text-xs cursor-pointer transition-colors duration-100"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                               */
/* ------------------------------------------------------------------ */

function RawEditor({ value, onChange }: BodyEditorProps<RawValue>) {
  const isJson = value.type === "json";

  // lightweight validity check — flags bad JSON inline without blocking
  // typing or sending. This is the seam for the fuller JSON editor/
  // validator you mentioned building next.
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
          {value.type}
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

/* ------------------------------------------------------------------ */
/* Serializer                                                          */
/* ------------------------------------------------------------------ */

function serializeRaw(value: RawValue): SerializedBody {
  const trimmed = value.content.trim();
  if (trimmed === "") return undefined; // covers all three types — nothing typed, nothing sent

  if (value.type === "json") {
    try {
      // parse + re-stringify: this is the "parse client-side" step —
      // it normalizes formatting and guarantees only valid JSON leaves
      // the browser when parsing succeeds
      return JSON.stringify(JSON.parse(value.content));
    } catch {
      // invalid JSON — send the raw text through for now rather than
      // silently dropping it; RawEditor already surfaces "Invalid JSON"
      // inline. This becomes a hard block once the JSON validator lands.
      return value.content;
    }
  }

  // 'text' and 'javascript': no parsing exists to do. JavaScript-as-a-
  // raw-body-type only ever changes the Content-Type label you'd send
  // (application/javascript) — the payload itself is plain text either way.
  return value.content;
}
const CONTENT_TYPES: Record<RawContentType, string> = {
  json: "application/json",
  javascript: "application/javascript",
  text: "text/plain",
};

export const rawConfig: BodyTypeConfig<RawValue> = {
  id: "raw",
  label: "raw",
  hint: "Send a raw payload — JSON, JavaScript, or plain text.",
  createInitialValue: (initialBody) => ({
    content: typeof initialBody === "string" ? initialBody : "",
    type: "json", // default, as requested
  }),
  serialize: serializeRaw,
  Editor: RawEditor,
  Toolbar: RawToolbar,
  getContentType: (value) => (value.content.trim() === "" ? null : CONTENT_TYPES[value.type]),
};