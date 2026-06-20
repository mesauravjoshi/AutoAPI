import { useState, useRef, useEffect } from "react";
// import axios from "axios";
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
// import {
//   // useDispatch,
//   useSelector
// } from "react-redux";
// import { RootState } from '@/store/Store'

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
  const [body, setBody] = useState("");
  const [header, setHeader] = useState<HeaderItem[]>([
    { key: "Content-Type", value: "application/json", enabled: true },
    { key: "", value: "", enabled: true },
  ]);

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

      // console.log(method);
      // console.log(headers);
      // console.log(body);
      // console.log(fullUrl);
      const payload = {
        method,
        headers,
        body,
        url: fullUrl,
      };

      const response = await api.post(`/request`, payload);
      // console.log(response);

      const end = performance.now();
      const time = end - start;
      const toString = JSON.stringify(response.data, null, 2);
      setDisplayResponse({
        data: toString,
        status: response.status,
        statusText: response.statusText,
        headers: {
          "content-type": response.headers["content-type"],
        },
        time: time,
        size: response.headers["content-length"]
          ? Number(response.headers["content-length"])
          : new Blob([JSON.stringify(response.data)]).size,
        url: response.request?.responseURL,

        ok: response.status >= 200 && response.status < 300,
        redirected: false,
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      // const end = performance.now();
      // const time = end - start;
      // if (axios.isAxiosError(error)) {
      //   // ✅ Server responded with error (4xx, 5xx)
      //   if (error.response) {
      //     console.log("Backend error:", error.response);

      //     setDisplayResponse({
      //       data: JSON.stringify(error.response.data, null, 2),
      //       status: error.response.status,
      //       statusText: error.response.statusText,
      //       // headers: error.response.headers,
      //       ok: false,
      //       time: time,
      //       size: 0,
      //       redirected: false,
      //       url: "",
      //     });
      //   }

      //   // ❌ No response (network error, server down)
      //   else if (error.request) {
      //     console.log("No response:", error.request);

      //     setDisplayResponse({
      //       data: "No response from server",
      //       status: 0,
      //       statusText: "Network Error",
      //       headers: {},
      //       ok: false,
      //       time: 0,
      //       size: 0,
      //       redirected: false,
      //       url: "",
      //     });
      //   } else {
      //     console.log("Error:", error.message);

      //     setDisplayResponse({
      //       data: error.message,
      //       status: 0,
      //       statusText: "Error",
      //       headers: {},
      //       ok: false,
      //       time: 0,
      //       size: 0,
      //       redirected: false,
      //       url: "",
      //     });
      //   }
      // } else {
      //   console.log("Unknown error:", error);
      // }
    }
  };
  // console.log(displayResponse);

  const handleSendReq = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setDisplayResponse(null);
    const isValid = ValidateURL(fullUrl);
    if (isValid) fetchAPI();
    // else setDisplayResponse('NO RECORD FOUND');
  };

  return (
    <div className="py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
      <div className=" mx-auto py-4">
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
