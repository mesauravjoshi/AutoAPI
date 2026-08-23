import { useState, useEffect, useCallback } from "react";
import { formDataConfig } from "./FormData";
import { urlEncodedConfig } from "./UrlEncoded";
import { rawConfig } from "./Raw";
import { HeaderItem } from '@/types/types';

export type BodyType = "form-data" | "x-www-form-urlencoded" | "raw";
export type SerializedBody = string | FormData | URLSearchParams | undefined;

export interface BodyEditorProps<T> {
  value: T;
  onChange: (value: T) => void;
}

export interface BodyTypeConfig<T = any> {
  id: BodyType;
  label: string;
  hint: string;
  createInitialValue: (initialBody?: SerializedBody) => T;
  serialize: (value: T) => SerializedBody;
  Editor: React.ComponentType<BodyEditorProps<T>>;
  /** Optional control rendered inline with the segmented control — e.g.
   *  raw's Text / JavaScript / JSON select. Only shown while this type
   *  is active. Omit for types that don't need one (form-data, urlencoded). */
  Toolbar?: React.ComponentType<BodyEditorProps<T>>;
  getContentType: (value: T) => string | null;
}

interface BodyWidgetProps {
  body: SerializedBody;
  setBody: (body: SerializedBody) => void;
  header?: HeaderItem[];
  setHeader: React.Dispatch<React.SetStateAction<HeaderItem[]>>;
}

const BODY_TYPE_CONFIGS: BodyTypeConfig[] = [formDataConfig, urlEncodedConfig, rawConfig];

export default function BodyWidget({ body, setBody, setHeader }: BodyWidgetProps) {
  const [bodyType, setBodyType] = useState<BodyType>("raw");

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

  useEffect(() => {
    setBody(config.serialize(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, bodyType]);

  const Editor = config.Editor;
  const Toolbar = config.Toolbar;

  // NEW — sync Content-Type header, mirroring AuthenticationWidget's
  // source-tagged sync. Runs whenever the active type or its value changes.
  useEffect(() => {
    const contentType = config.getContentType(value);

    setHeader((prev) => {
      const withoutBodyHeader = prev.filter((h) => h.source !== "body");
      if (!contentType) return withoutBodyHeader;

      // don't clobber a Content-Type the user typed manually with source 'user'
      const userOverride = prev.find(
        (h) => h.source === "user" && h.key.toLowerCase() === "content-type"
      );
      if (userOverride) return withoutBodyHeader;

      return [
        ...withoutBodyHeader,
        { id: crypto.randomUUID(), key: "Content-Type", value: contentType, enabled: true, source: "body" },
      ];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, bodyType]);

  return (
    <div className="w-full overflow-auto min-h-45.5 max-h-45.5">
      {/* Segmented control row — Toolbar (if any) sits to its right,
          same pattern Postman uses for the raw-type dropdown */}
      <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-700">
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

        {Toolbar && <Toolbar value={value} onChange={handleChange} />}
      </div>

      <p className="mt-1.5 mb-3 text-xs text-gray-400 dark:text-gray-500">{config.hint}</p>

      <div className="mx-1">
        <Editor value={value} onChange={handleChange} />
      </div>
    </div>
  );
}