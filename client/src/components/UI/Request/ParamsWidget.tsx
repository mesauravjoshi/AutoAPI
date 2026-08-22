import { X as XMarkIcon, Plus as PlusIcon } from 'lucide-react';
import QueryString from '@/utils/queryString';
import { ParamItem } from '@/types/types';
import Checkbox from '@/components/UI/Common/Checkbox';

interface ParamsWidgetProps {
  params: ParamItem[];
  setParams: (params: ParamItem[]) => void;
  fullUrl: string;
  setFullUrl: (url: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const INPUT_CLASS =
  'block w-full rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors font-mono';

const ParamsWidget: React.FC<ParamsWidgetProps> = ({
  params,
  setParams,
  fullUrl,
  setFullUrl,
  // inputRef
}) => {

  const handleParamChange = (index: number, field: string, value: string) => {
    const updatedParams = [...params];
    updatedParams[index] = { ...updatedParams[index], [field]: value };
    setParams(updatedParams);

    const indexOf_Q = fullUrl.indexOf('?')

    // const validParams = updatedParams
    //   .filter(param => param.enabled && param.key.trim() !== '')
    //   .map(param =>
    //     `${encodeURIComponent(param.key.length > 0 ? param.key : 'a')}=${encodeURIComponent(param.value)}`
    //   );
    // const queryString = validParams.length ? `?${validParams.join('&')}` : '';
    // console.log(updatedParams);

    const queryString = QueryString(updatedParams);

    if (indexOf_Q === -1) {
      // console.log('not found ? mark');

      setFullUrl(fullUrl + queryString);
    } else {

      // console.log('found ? mark', params);
      const parts = fullUrl.split('?');

      const urlArray = [parts[0], '?' + parts[1]];

      const firstPart = urlArray.length > 0 && urlArray[0];

      setFullUrl(firstPart + queryString)
    }
  };

  const addNewParam = () => {
    setParams([
      ...params,
      { id: Date.now(), key: '', value: '', enabled: true }
    ]);
  };

  const deleteParam = (id: number) => {
    if (params.length <= 1) return;
    setParams(params.filter(param => param.id !== id));
  };

  const toggleParam = (id: number) => {
    setParams(params.map(param =>
      param.id === id ? { ...param, enabled: !param.enabled } : param
    ));
  };

  return (
    <div className="mt-2 overflow-auto min-h-45.5 max-h-45.5">
      <div className="grid grid-cols-12 gap-2 items-center mb-2">
        <div className="col-span-1 flex justify-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Enabled</span>
        </div>
        <div className="col-span-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Key</span>
        </div>
        <div className="col-span-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Value</span>
        </div>
        <div className="col-span-1 flex justify-center">
          <button
            type="button"
            onClick={addNewParam}
            aria-label="Add parameter"
            className="flex items-center justify-center rounded-full p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {params.map((param, index) => (
        <div key={param.id} className="grid grid-cols-12 gap-2 items-center mb-2">
          <div className="col-span-1 flex justify-center">
            <Checkbox
              checked={param.enabled}
              onChange={() => toggleParam(param.id)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-600 dark:focus:ring-blue-400"
            />
          </div>

          <div className="col-span-4">
            <input
              type="text"
              value={param.key}
              onChange={(e) => handleParamChange(index, 'key', e.target.value)}
              className={INPUT_CLASS}
              placeholder="Key"
            />
          </div>

          <div className="col-span-6">
            <input
              type="text"
              value={param.value}
              onChange={(e) => handleParamChange(index, 'value', e.target.value)}
              className={INPUT_CLASS}
              placeholder="Value"
            />
          </div>

          <div className="col-span-1 flex justify-center">
            <button
              onClick={() => deleteParam(param.id)}
              disabled={params.length <= 1}
              className={`rounded-full p-1 transition-colors ${params.length > 1
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ParamsWidget