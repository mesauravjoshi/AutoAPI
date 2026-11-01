import type { BodyTypeConfig } from ".";
import UrlEncodedEditor from "./UrlEncodedEditor";
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

export const urlEncodedConfig: BodyTypeConfig<UrlEncodedRow[]> = {
  id: "x-www-form-urlencoded",
  label: "x-www-form-urlencoded",
  hint: "Send simple key-value pairs, URL-encoded.",
  createInitialValue: () => [createUrlEncodedRow()],
  serialize: serializeUrlEncoded,
  Editor: UrlEncodedEditor,
  getContentType: () => "application/x-www-form-urlencoded",
};