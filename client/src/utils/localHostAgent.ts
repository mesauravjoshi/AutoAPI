import axios, { AxiosError } from "axios";
import api from "@/lib/api";
import {
  HeaderItem,
  MethodsTypes,
  DisplayResponse,
} from "@/types/types";

// Shape of what gets sent to the backend to persist in the DB.
// Adjust field names here if your /history route expects a different shape.
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

// Saves the request/response pair to the DB via the backend.
// Adjust the endpoint/payload shape to match your actual history-save route.
export const saveToHistory = async (payload: HistoryPayload): Promise<void> => {
  try {
    await api.post("/local-agent/request", payload);
  } catch (err) {
    // Don't block the UI if saving fails — just log it
    console.log("Failed to save local request to history:", err);
  }
};

/**
 * Sends a request directly from the browser (bypasses the backend for the
 * actual call, since the backend can't reach the user's localhost), then
 * separately persists the result to the DB via the backend's /history route.
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

    const response = await axios({ url: fullUrl, method, headers, data: body });

    const end = performance.now();
    const time = end - start;
    const responseString = JSON.stringify(response.data, null, 2);

    // response.request is not part of AxiosResponse's public type in
    // browser builds, so we read it defensively via a typed cast instead
    // of `any`.
    const responseUrl =
      (response.request as XMLHttpRequest | undefined)?.responseURL ?? fullUrl;

    const result: DisplayResponse = {
      data: responseString,
      status: response.status,
      statusText: response.statusText,
      headers: {
        "content-type": response.headers["content-type"] ?? "",
      },
      time,
      size: response.headers["content-length"]
        ? Number(response.headers["content-length"])
        : new Blob([JSON.stringify(response.data)]).size,
      url: responseUrl,
      ok: response.status >= 200 && response.status < 300,
      redirected: false,
    };

    setDisplayResponse(result);
    setLoading(false);

    // Fire-and-forget: persist to DB via backend (backend just stores it,
    // it doesn't need to reach localhost).
    void saveToHistory({
      method,
      url: fullUrl,
      headers,
      body,
      status: result.status,
      statusText: result.statusText,
      responseData: responseString,
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
        const errResult: DisplayResponse = {
          data: JSON.stringify(axiosError.response.data, null, 2),
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
          responseData: errResult.data,
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