import { Trash2 as TrashIcon } from 'lucide-react';
import { HeaderItem } from '@/types/types';

interface ParamsWidgetProps {
  header: HeaderItem[];
  setHeader: React.Dispatch<React.SetStateAction<HeaderItem[]>>;
}

const HeaderWidget: React.FC<ParamsWidgetProps> = ({
  header, setHeader
}) => {

  const addHeaderRow = () => {
    setHeader([...header, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...header];
    updated[index][field] = value;
    setHeader(updated);
  };

  const removeHeaderRow = (index: number) => {
    const updated = header.filter((_, i) => i !== index);
    setHeader(updated);
  };

  return (
    <div className="space-y-2 overflow-auto min-h-45.5 max-h-45.5 mt-2">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              <th className="pb-2">Key</th>
              <th className="pb-2">Value</th>
              <th className="pb-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {header.map((item, index) => (
              <tr key={index}>
                <td className="py-2 pr-2">
                  <input
                    type="text"
                    className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    value={item.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    placeholder="Content-Type"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="text"
                    className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    value={item.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    placeholder="application/json"
                  />
                </td>
                <td className="py-2">
                  <button
                    onClick={() => removeHeaderRow(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    <TrashIcon className="w-5 h-5 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addHeaderRow}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
      >
        + Add Header
      </button>
    </div>
  )
}

export default HeaderWidget