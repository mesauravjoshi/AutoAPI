// client/src/utils/localHostAgent.ts
import axios, { AxiosError } from "axios";
import api from "@/lib/api";
import {
  HeaderItem,
  MethodsTypes,
  DisplayResponse,
} from "@/types/types";

export interface HistoryPayload {
  method: MethodsTypes;
  url: string;
  headers: Record<string, string>;
  body: string | FormData | URLSearchParams | undefined;
  status: number;
  statusText: string;
  responseData: string;
  time: number;
  size: number;
  ok: boolean;
}

export interface LocalHostAgentProps {
  fullUrl: string;
  method: MethodsTypes;
  header: HeaderItem[];
  body: string | FormData | URLSearchParams | undefined;
  setLoading: (loading: boolean) => void;
  setDisplayResponse: (response: DisplayResponse | null) => void;
}

export const buildHeaders = (header: HeaderItem[]): Record<string, string> => {
  const headers: Record<string, string> = {};
  header.forEach((item) => {
    if (item.key && item.value && item.enabled !== false) {
      headers[item.key] = item.value;
    }
  });
  return headers;
};

export const saveToHistory = async (payload: HistoryPayload): Promise<void> => {
  try {
    await api.post("/local-agent/request", payload);
  } catch (err) {
    // Don't block the UI if saving fails — just log it
  }
};

// Browser-native replacement for Node's Buffer.toString("base64").
// Chunked so we don't blow the call stack on String.fromCharCode(...bigArray)
// for large binary payloads (images, pdfs, etc.).
const arrayBufferToBase64 = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

// Content-types we can safely decode as UTF-8 text (JSON, HTML, plain text, XML, etc).
// Anything else (images, video, pdf, zip, octet-stream, fonts...) is treated as binary.
const isTextLikeContentType = (contentType = "") => {
  const ct = contentType.toLowerCase();
  if (!ct) return true;
  return (
    ct.includes("application/json") ||
    ct.includes("text/") ||
    ct.includes("xml") ||
    ct.includes("javascript") ||
    ct.includes("urlencoded")
  );
};

/**
 * Sends a request directly from the browser (bypasses the backend for the
 * actual call, since the backend can't reach the user's localhost), then
 * separately persists the result to the DB via the backend's /history route.
 *
 * Mirrors executeApiRequest on the server: raw bytes in via
 * responseType:"arraybuffer", then text vs binary decided the same way.
 */
export const localHostAgent = async ({
  fullUrl,
  method,
  header,
  body,
  setLoading,
  setDisplayResponse,
}: LocalHostAgentProps): Promise<void> => {
  const start = performance.now();
  const headers = buildHeaders(header);

  try {
    setLoading(true);

    // Talking straight to the target API here (not our backend), so send
    // the real body — axios handles FormData/URLSearchParams/string natively.
    // No {type,data} wrapper needed (that's only for JSON-transport to our own backend).
    const response = await axios({
      url: fullUrl,
      method,
      headers,
      data: body,
      responseType: "arraybuffer",
      validateStatus: () => true,
    });

    const end = performance.now();
    const time = end - start;

    const contentType = response.headers["content-type"] || "";
    const buf: ArrayBuffer = response.data; // raw bytes, thanks to responseType above

    let data;
    let dataUrl;

    if (isTextLikeContentType(contentType)) {
      const text = new TextDecoder("utf-8").decode(buf);
      if (contentType.toLowerCase().includes("application/json")) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text; // not actually valid JSON despite the header
        }
      } else {
        data = text;
      }
    } else {
      dataUrl = `data:${contentType};base64,${arrayBufferToBase64(buf)}`;
      data = null;
    }

    const responseHeaders =
      typeof (response.headers as any)?.toJSON === "function"
        ? (response.headers as any).toJSON()
        : (response.headers as Record<string, string>);

    const result: DisplayResponse = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      time,
      size: buf.byteLength, // exact byte length — same semantics as backend's buffer.length
      url: fullUrl,
      ok: response.status >= 200 && response.status < 300,
      redirected: false,
      dataUrl,
    };

    setDisplayResponse(result);
    setLoading(false);

    void saveToHistory({
      method,
      url: fullUrl,
      headers,
      body,
      status: result.status,
      statusText: result.statusText,
      responseData: isTextLikeContentType(contentType)
        ? typeof data === "string"
          ? data
          : JSON.stringify(data)
        : `[binary ${contentType || "unknown"}, ${buf.byteLength} bytes]`,
      time: result.time,
      size: result.size,
      ok: result.ok,
    });
  } catch (error) {
    setLoading(false);
    const end = performance.now();
    const time = end - start;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        // response.data is still an ArrayBuffer here (responseType was set
        // above), so decode before we can read/stringify it.
        let errorData = "";
        try {
          const errBuf = axiosError.response.data as ArrayBuffer;
          errorData = new TextDecoder("utf-8").decode(errBuf);
          try {
            errorData = JSON.stringify(JSON.parse(errorData), null, 2);
          } catch {
            // not JSON, keep raw decoded text
          }
        } catch {
          errorData = "Unable to read error response body";
        }

        const errResult: DisplayResponse = {
          data: errorData,
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          headers: {},
          ok: false,
          time,
          size: 0,
          redirected: false,
          url: "",
        };
        setDisplayResponse(errResult);

        void saveToHistory({
          method,
          url: fullUrl,
          headers,
          body,
          status: errResult.status,
          statusText: errResult.statusText,
          responseData: errResult.data as string,
          time: errResult.time,
          size: errResult.size,
          ok: false,
        });
      } else if (axiosError.request) {
        setDisplayResponse({
          data: "No response from server",
          status: 0,
          statusText: "Network Error",
          headers: {},
          ok: false,
          time: 0,
          size: 0,
          redirected: false,
          url: "",
        });
      } else {
        setDisplayResponse({
          data: axiosError.message,
          status: 0,
          statusText: "Error",
          headers: {},
          ok: false,
          time: 0,
          size: 0,
          redirected: false,
          url: "",
        });
      }
    } else {
      console.log("Unknown error:", error);
    }
  }
};