import type { BodyTypeConfig } from ".";
import FormDataEditor from "./FormDataEditor";

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

export const formDataConfig: BodyTypeConfig<FormDataRow[]> = {
  id: "form-data",
  label: "form-data",
  hint: "Send fields and files as multipart/form-data.",
  createInitialValue: () => [createFormDataRow()],
  serialize: serializeFormData,
  Editor: FormDataEditor,
  getContentType: () => null,
};