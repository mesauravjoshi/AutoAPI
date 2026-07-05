// Request/index.tsx
import { useState } from 'react'
import { ChevronDown as ChevronDownIcon } from 'lucide-react';
import BodyWidget from './BodyWidget';
import HeaderWidget from './HeaderWidget';
import ParamsWidget from './ParamsWidget';
import { HeaderItem, ParamItem } from '@/types/types';

interface RequestProps {
  body: string;
  setBody: (body: string) => void;
  header: HeaderItem[];
  setHeader: React.Dispatch<React.SetStateAction<HeaderItem[]>>;
  params: ParamItem[];
  setParams: (params: ParamItem[]) => void;
  fullUrl: string;
  setFullUrl: (url: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const tabs = [
  { name: 'Body', href: '#', current: true },
  { name: 'Header', href: '#', current: false },
  { name: 'Authentication', href: '#', current: false },
  { name: 'Params', href: '#', current: false },
]

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function Request({
  body,
  setBody,
  header,
  setHeader,
  params,
  setParams,
  fullUrl,
  setFullUrl,
  inputRef
}: RequestProps) {

  const [currentTab, setCurrentTab] = useState('Body');

  const renderTabContent = () => {
    switch (currentTab) {
      case 'Body':
        return <BodyWidget body={body} setBody={setBody} />;
      case 'Header':
        return <HeaderWidget header={header} setHeader={setHeader} />;
      case 'Authentication':
        return <div className='text-gray-700 dark:text-gray-300'>Authentication Widget Here</div>;
      case 'Params':
        return <ParamsWidget
          params={params}
          setParams={setParams}
          setFullUrl={setFullUrl}
          fullUrl={fullUrl}
          inputRef={inputRef}
        />
      default:
        return null;
    }
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 sm:hidden">
        <select
          defaultValue={tabs.find((tab) => tab.current)?.name}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-gray-800 py-2 pr-8 pl-3 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-400 transition-colors"
          onChange={(e) => setCurrentTab(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500 dark:fill-gray-400"
        />
      </div>

      <div className='rounded-lg mt-2 overflow-auto min-h-45.5 max-h-45.5'>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTab(tab.name)}
                  className={classNames(
                    currentTab === tab.name
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300',
                    'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors'
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}