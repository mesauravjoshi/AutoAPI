import { useState, useEffect, useCallback } from "react";
import { formDataConfig } from "./FormData";
import { urlEncodedConfig } from "./UrlEncoded";
import { rawConfig } from "./Raw";

/* ------------------------------------------------------------------ */
/* Shared contracts. Only TYPES live here — every type-only import    */
/* below (`import type {...} from "./index"`) is erased at compile    */
/* time, so there is no runtime circular dependency even though       */
/* FormData.tsx / UrlEncoded.tsx / Raw.tsx import these types back.   */
/* ------------------------------------------------------------------ */

export type BodyType = "form-data" | "x-www-form-urlencoded" | "raw";

/** What every request lib (axios/fetch) can actually take as `data`.  */
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
  /** Must return `undefined` (not "") when there's nothing to send —
   *  that's what stops axios from shipping an empty-string body that
   *  breaks JSON.parse on servers expecting Content-Type: application/json. */
  serialize: (value: T) => SerializedBody;
  Editor: React.ComponentType<BodyEditorProps<T>>;
}

interface BodyWidgetProps {
  body: SerializedBody;
  setBody: (body: SerializedBody) => void;
}

/* ================================================================== */
/* Registry — the ONLY place that changes to add a new body type.     */
/* Write FooBar.tsx (row type + Editor + config, self-contained),     */
/* import it, push it in here. Nothing else in this file changes.     */
/* ================================================================== */

const BODY_TYPE_CONFIGS: BodyTypeConfig[] = [formDataConfig, urlEncodedConfig, rawConfig];

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

  // push the serialized, request-ready value up to the parent.
  // each config's serialize() already resolves "nothing entered" to
  // the type-correct empty shape (empty FormData / empty URLSearchParams
  // / undefined) — see FormData.tsx, UrlEncoded.tsx, Raw.tsx.
  useEffect(() => {
    // console.log();
    
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
              className={`relative cursor-pointer select-none rounded-md px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 ${
                isActive
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