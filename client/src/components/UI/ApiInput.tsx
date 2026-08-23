import { RefObject } from "react"
import { MethodsTypes } from '@/types/types';
// import UrlEditor from "@/components/Monaco/UrlEditor";
import CustomSelect from "@/components/UI/Customselect";

interface ApiInputProps {
  fullUrl: string;
  setFullUrl: (url: string) => void;
  handleSendReq: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  setMethod: React.Dispatch<React.SetStateAction<MethodsTypes>>;
  setOpenRightSlider: React.Dispatch<React.SetStateAction<boolean>>;
  selected: MethodsTypes;
  setSelected: React.Dispatch<React.SetStateAction<MethodsTypes>>;
}

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function ApiInput({ fullUrl, setFullUrl, handleSendReq, inputRef, setMethod, setOpenRightSlider, selected, setSelected }: ApiInputProps) {
  // const [selected, setSelected] = useState("GET");

  const handleSelect = (m: MethodsTypes) => {
    setSelected(m);
    setMethod(m.toLowerCase() as MethodsTypes);
  };

  const handleBaseUrlChange = (event: React.ChangeEvent<HTMLInputElement> | string) => {
    const url = typeof event === "string" ? event : event.target.value;
    const indexOf_Q = url.indexOf("?");

    if (indexOf_Q > 0) {
      const input = inputRef.current;
      const cursorIndex = input?.selectionStart || 0;

      const parts = url.split("?");
      const urlArray = [parts[0], "?" + parts[1]];

      const firstPart = urlArray.length > 0 ? urlArray[0] : "";
      const secondPart = urlArray.length > 0 ? urlArray[1] : "";

      if (cursorIndex > indexOf_Q) {
        const queryString = secondPart ? secondPart : "";
        setFullUrl(firstPart + queryString);
      }
      if (cursorIndex < indexOf_Q) {
        const URLString = firstPart ? firstPart : "";
        setFullUrl(URLString + secondPart);
      }
      if (cursorIndex === indexOf_Q) {
        setFullUrl(firstPart + secondPart);
      }
    } else {
      setFullUrl(url);
    }
  };

  return (
    <div className="flex relative">

      <CustomSelect
        value={selected}
        onChange={(m) => handleSelect(m as MethodsTypes)}
        options={methods}
        wrapperClassName=""
        buttonClassName="rounded-md border border-gray-500 dark:border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 h-full"
        dropdownClassName="top-11 left-0 w-28 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-700"
        optionClassName="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-500 hover:text-white"
        optionSelectedClassName="bg-indigo-600 text-white"
        optionUnselectedClassName="text-gray-700 dark:text-gray-200"
        renderTrigger={({ selected }) => <>{selected?.value}</>}
      />

      {/* input */}
      <div className="grow">
        <input
          ref={inputRef}
          type="url"
          name="api-url"
          autoComplete="on"
          className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-2.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 dark:focus:outline-indigo-400 sm:text-sm/6 transition-colors"
          value={fullUrl}
          onChange={handleBaseUrlChange}
          placeholder="https://api.example.com/resource"
        />
      </div>

      <button
        className="ml-1.5 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
        onClick={handleSendReq}
      >
        Send
      </button>
      <button
        className="ml-1.5 rounded-md bg-amber-600 px-1 py-2 text-sm font-semibold text-white cursor-pointer"
        onClick={() => setOpenRightSlider(true)}
      >
        {`</>`}
      </button>
    </div>
  )
}