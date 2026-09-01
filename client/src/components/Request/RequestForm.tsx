// client/src/components/Request/RequestForm.tsx
import { defaultAuthState, AuthState } from '@/components/UI/Request/AuthenticationWidget';
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ValidateURL from '@/utils/validateURL';
import ApiInput from "@/components/UI/ApiInput";
import Request from "@/components/UI/Request/Request";
import Response from "@/components/UI/Response";
import {
  HeaderItem,
  ParamItem,
  MethodsTypes,
  DisplayResponse,
} from "@/types/types";
import SnippetSlide from "@/components/UI/SnippetSlide";
import api from "@/lib/api";
import { ApiHistory, RequestItem } from '@/types/types';
import { isLocalApiUrl } from "@/utils/isLocalApiUrl";
import { localHostAgent } from "@/utils/localHostAgent";

export default function RequestForm({
  defaultData,
}: {
  defaultData?: ApiHistory | RequestItem;
}) {
  // export default function RequestForm({default}:{default : string}) {
  const [method, setMethod] = useState<MethodsTypes>("GET");
  const [selected, setSelected] = useState<MethodsTypes>("GET");
  const [displayResponse, setDisplayResponse] = useState<DisplayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState<string | FormData | URLSearchParams | undefined>(undefined);
  const [header, setHeader] = useState<HeaderItem[]>([
    // { key: "Content-Type", value: "application/json", enabled: true },
    // { key: "", value: "", enabled: true },
  ]);
  const [auth, setAuth] = useState<AuthState>(defaultAuthState);
  // ...pass auth={auth} setAuth={setAuth} into <Request />
  const [params, setParams] = useState<ParamItem[]>([
    { id: Date.now(), key: "", value: "", enabled: true },
  ]);
  const [fullUrl, setFullUrl] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [openRightSlider, setOpenRightSlider] = useState(false);
  const [activeLang, setActiveLang] = useState<"curl" | "fetch" | "axios">("curl",);

  useEffect(() => {
    if (defaultData) {
      // console.log(defaultData.method);
      setSelected(defaultData.method);
      setMethod(defaultData.method);
      if (defaultData?.url) {
        setFullUrl(defaultData?.url);
      } else {
        setFullUrl(defaultData.url);
      }
    }
  }, [defaultData])

  const buildHeaders = () => {
    const headers: Record<string, string> = {};
    header.forEach((item) => {
      if (item.key && item.value && item.enabled !== false) {
        headers[item.key] = item.value;
      }
    });
    return headers;
  };

  const fetchAPI = async () => {
    const start = performance.now();
    try {
      setLoading(true);
      const headers = buildHeaders();
      let serializedBody;

      if (body instanceof FormData) {
        serializedBody = {
          type: "formData",
          data: Array.from(body.entries()),
        };
      } else if (body instanceof URLSearchParams) {
        serializedBody = {
          type: "urlSearchParams",
          data: body.toString(),
        };
      } else {
        serializedBody = {
          type: "string",
          data: body,
        };
      }

      const payload = {
        url: fullUrl,
        method,
        headers,
        body: serializedBody,
      };

      const response = await api.post(`/request`, payload);
      const end = performance.now();
      const time = end - start;

      const result = response.data; // { status, statusText, headers, data, dataUrl?, size, responseTime }

      setDisplayResponse({
        data: result.data,
        status: result.status,
        statusText: result.statusText,
        headers: result.headers ?? {},
        time,
        size: result.size, // now the real byte length from the backend, works for binary too
        url: fullUrl,
        ok: result.status >= 200 && result.status < 300,
        redirected: false,
        dataUrl: result.dataUrl, // set for images/video/pdf, undefined for json/html/text
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      const end = performance.now();
      const time = end - start;

      // At this point, axios threw — meaning YOUR backend itself failed
      // (network/DNS error reaching target -> 502, validation error -> 400,
      // auth error -> 401 on YOUR api, etc). This is NOT the target API's status.
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log("Backend error:", error.response);

          setDisplayResponse({
            data: JSON.stringify(error.response.data, null, 2),
            status: error.response.status,
            statusText: error.response.statusText,
            headers: {},
            ok: false,
            time: time,
            size: 0,
            redirected: false,
            url: "",
          });
        } else if (error.request) {
          console.log("No response:", error.request);

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
          console.log("Error:", error.message);

          setDisplayResponse({
            data: error.message,
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

  const handleSendReq = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setDisplayResponse(null);
    const isValid = ValidateURL(fullUrl);
    if (!isValid) return;

    const isLocal = isLocalApiUrl(fullUrl);
    if (isLocal && isValid) {
      localHostAgent({ fullUrl, method, header, body, setLoading, setDisplayResponse });
      return
    } else {
      if (isValid) fetchAPI();
    }
    // else setDisplayResponse('NO RECORD FOUND');
  };

  return (
    <div className="pt-2 pb-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
      <div className=" mx-auto py-1">
        <ApiInput
          fullUrl={fullUrl}
          setFullUrl={setFullUrl}
          handleSendReq={handleSendReq}
          inputRef={inputRef}
          setMethod={setMethod}
          setOpenRightSlider={setOpenRightSlider}
          selected={selected}
          setSelected={setSelected}
        />

        <Request
          body={body}
          setBody={setBody}
          header={header}
          setHeader={setHeader}
          params={params}
          setParams={setParams}
          fullUrl={fullUrl}
          setFullUrl={setFullUrl}
          inputRef={inputRef}
          auth={auth}
          setAuth={setAuth}
        />

        <Response displayResponse={displayResponse} loading={loading} />
      </div>

      <SnippetSlide
        open={openRightSlider}
        onClose={() => setOpenRightSlider(false)}
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        method={method}
        fullUrl={fullUrl}
        headers={buildHeaders()}
        body={body}
      />
    </div>
  );
}
