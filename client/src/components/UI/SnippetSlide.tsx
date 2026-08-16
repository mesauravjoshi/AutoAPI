import React from "react";
import { MethodsTypes } from '@/types/types';

// type MethodsTypes = "get" | "post" | "put" | "patch" | "delete";
type SnippetAPICallTypes = "curl" | "fetch" | "axios";
type ExtendedMethodsTypes = MethodsTypes | "get" | "post" | "put" | "patch" | "delete";

interface SnippetSlideProps {
  open: boolean;
  onClose: () => void;
  activeLang: "curl" | "fetch" | "axios";
  setActiveLang: (lang: "curl" | "fetch" | "axios") => void;
  method: ExtendedMethodsTypes;
  fullUrl: string;
  headers: Record<string, string>;
  body: string | FormData;
}

const SnippetSlide: React.FC<SnippetSlideProps> = ({
  open,
  onClose,
  activeLang,
  setActiveLang,
  method,
  fullUrl,
  headers,
  body,
}) => {

  const generateCodeSnippet = () => {
    const headerString = Object.entries(headers)
      .map(([k, v]) => `"${k}": "${v}"`)
      .join(",\n");

    const bodyData = body ? body : "{}";

    switch (activeLang) {
      case "curl":
        return `curl -X ${method.toUpperCase()} "${fullUrl}" \\
${Object.entries(headers)
            .map(([k, v]) => `  -H "${k}: ${v}"`)
            .join(" \\\n")}
${method !== "get" && method !== "delete" ? `  -d '${bodyData}'` : ""}`;

      case "fetch":
        return `fetch("${fullUrl}", {
  method: "${method.toUpperCase()}",
  headers: {
    ${headerString}
  },
  ${method !== "get" && method !== "delete"
            ? `body: JSON.stringify(${bodyData})`
            : ""
          }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));`;

      case "axios":
        return `axios.${method}("${fullUrl}", ${method !== "get" && method !== "delete" ? bodyData : "{}"
          }, {
  headers: {
    ${headerString}
  }
})
.then(res => console.log(res.data))
.catch(err => console.error(err));`;

      default:
        return "";
    }
  };

  return (
    <>
      {/* RIGHT SLIDER */}
      <div
        className={`absolute top-0 right-0 h-full w-95 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 z-30 ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-2 items-center">
            <span className="text-[12px] font-bold text-amber-500">{`</>`}</span>
            <h2 className="text-sm/6 font-semibold text-gray-800 dark:text-gray-200">
              Code Snippet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-lg dark:text-gray-200 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* LANG TABS */}
        <div className="flex gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-800 text-xs">
          {["curl", "fetch", "axios"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang as SnippetAPICallTypes)}
              className={`text-sm/6 px-3 py-1 rounded-md transition ${activeLang === lang
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* CODE */}
        <div className="p-4 text-xs overflow-auto h-[calc(100%-100px)]">
          <pre className="whitespace-pre-wrap wrap-break-word text-gray-800 dark:text-gray-200">
            {generateCodeSnippet()}
          </pre>
        </div>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/30 z-20"
        />
      )}
    </>
  );
};

export default SnippetSlide;