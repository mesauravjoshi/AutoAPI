// import { useMemo } from "react";
import type { BodyEditorProps } from "./index";
import CustomSelect, { SelectOption } from "@/components/UI/Customselect"; // adjust path to wherever CustomSelect actually lives
import type { RawValue, RawContentType } from "./Raw";
// import RawEditor from "./RawEditor";

/* ------------------------------------------------------------------ */
/* Toolbar — the raw-type dropdown, styled to match the segmented      */
/* control's pill: same height/padding/text size, indigo "active"      */
/* treatment, so it reads as one connected control rather than a       */
/* bolted-on <select>.                                                 */
/* ------------------------------------------------------------------ */

const RAW_TYPE_OPTIONS: SelectOption<RawContentType>[] = [
  { value: "text", label: "Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
];

export default function RawToolbar({ value, onChange }: BodyEditorProps<RawValue>) {
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
