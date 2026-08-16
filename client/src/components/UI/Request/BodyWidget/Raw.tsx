import type { BodyEditorProps, BodyTypeConfig, SerializedBody } from ".";

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

/* ------------------------------------------------------------------ */
/* Serializer — blank textarea → undefined, not "". This is the fix   */
/* for the server-side error: axios omits `data` entirely when it's   */
/* undefined, instead of sending an empty string that fails JSON.parse */
/* on a server expecting Content-Type: application/json.               */
/*                                                                     */
/* TODO (when you add the JSON validator): this is the natural spot   */
/* to run the "raw" value through JSON.parse before it leaves the     */
/* widget, and surface a validation error inline instead of letting   */
/* a malformed body reach the network.                                */
/* ------------------------------------------------------------------ */

function serializeRaw(value: string): SerializedBody {
  return value.trim() === "" ? undefined : value;
}

export const rawConfig: BodyTypeConfig<string> = {
  id: "raw",
  label: "raw",
  hint: "Send a raw payload — JSON, XML, text, anything.",
  createInitialValue: (initialBody) => (typeof initialBody === "string" ? initialBody : ""),
  serialize: serializeRaw,
  Editor: RawEditor,
};