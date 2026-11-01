// import { useMemo } from "react";
import type { BodyTypeConfig, SerializedBody } from "./index";
// import CustomSelect, { SelectOption } from "@/components/UI/Customselect"; // adjust path to wherever CustomSelect actually lives
import RawEditor from "./RawEditor";
import RawToolbar from "./RawToolbar";

export type RawContentType = "text" | "javascript" | "json";

export interface RawValue {
  content: string;
  type: RawContentType;
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