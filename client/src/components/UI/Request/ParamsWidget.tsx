import { XMarkIcon } from '@heroicons/react/24/outline';
import QueryString from '@/utils/queryString';
import { ParamItem } from '@/types/types';

interface ParamsWidgetProps {
  params: ParamItem[];
  setParams: (params: ParamItem[]) => void;
  fullUrl: string;
  setFullUrl: (url: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

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
    console.log(updatedParams);

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
    <div className="mt-4">
      {/* <h3 className="text-lg font-medium text-white mb-3">Query Parameters</h3> */}

      <div className="grid grid-cols-12 gap-2 items-center mb-2">
        <div className="col-span-1 flex justify-center">
          <span className="text-sm font-medium text-white">Enabled</span>
        </div>
        <div className="col-span-4">
          <span className="text-sm font-medium text-white">Key</span>
        </div>
        <div className="col-span-6">
          <span className="text-sm font-medium text-white">Value</span>
        </div>
        <div className="col-span-1 text-white " onClick={addNewParam}>+ Add</div>
      </div>

      {params.map((param, index) => (
        <div key={param.id} className="grid grid-cols-12 gap-2 items-center mb-2">
          <div className="col-span-1 flex justify-center">
            <input
              type="checkbox"
              checked={param.enabled}
              onChange={() => toggleParam(param.id)}
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-gray-900"
            />
          </div>

          <div className="col-span-4">
            <input
              type="text"
              value={param.key}
              onChange={(e) => handleParamChange(index, 'key', e.target.value)}
              className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
              placeholder="Key"
            />
          </div>

          <div className="col-span-6">
            <input
              type="text"
              value={param.value}
              onChange={(e) => handleParamChange(index, 'value', e.target.value)}
              className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
              placeholder="Value"
            />
          </div>

          <div className="col-span-1 flex justify-center">
            <button
              onClick={() => deleteParam(param.id)}
              disabled={params.length <= 1}
              className={`rounded-full p-1 ${params.length > 1
                ? 'text-red-400 hover:bg-white/10 hover:text-red-300'
                : 'text-gray-500 cursor-not-allowed'
                }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}

      {/* <button
        onClick={addNewParam}
        className="mt-3 flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
      >
        <PlusIcon className="h-4 w-4" />
        Add Parameter
      </button> */}
    </div>
  )
}

export default ParamsWidget