import { useState } from 'react';
import { DisplayResponse } from '@/types/types';

interface ResponseProps {
  displayResponse: DisplayResponse | null;
  loading: boolean
}

export default function Response({ displayResponse, loading }: ResponseProps) {
  const [copied, setCopied] = useState(false);
  // const [isBodyOpen, setIsBodyOpen] = useState(true);

  const handleCopy = () => {
    if (!displayResponse) return;
    navigator.clipboard.writeText(displayResponse.data)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };

  const handleDownload = (): void => {
    if (!displayResponse) return;

    const blob = new Blob([displayResponse.data], { type: 'application/json' });

    const url: string = URL.createObjectURL(blob);

    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = 'response.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  type StatusColor = 'green' | 'yellow' | 'red' | 'gray';

  const formatStatus = (status?: number): { text: string; color: StatusColor } => {
    if (!status) return { text: '200 OK', color: 'green' };
    if (status >= 200 && status < 300) return { text: `${status} OK`, color: 'green' };
    if (status >= 300 && status < 400) return { text: `${status} Redirect`, color: 'yellow' };
    if (status >= 400 && status < 500) return { text: `${status} Client Error`, color: 'red' };
    if (status >= 500) return { text: `${status} Server Error`, color: 'red' };
    return { text: `${status}`, color: 'gray' };
  };

  const statusInfo = formatStatus(displayResponse?.status);

  const statusColorMap = {
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };

  return (
    <div className="w-full">
      {/* Header with gradient accent */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Response</h2>
        </div>
        {displayResponse && (
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleDownload}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save
          </button>
        )}
      </div>

      {/* Main Response Card */}
      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-xl overflow-hidden transition-all duration-300">
        {/* Animated Loading Bar */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500">
            <div className="absolute top-0 left-0 h-full w-full animate-pulse"></div>
          </div>
        )}

        {/* Response Metadata Bar - Only visible when response exists */}
        {displayResponse && (
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Dropdown Toggle */}
              <button
                // onClick={() => setIsBodyOpen(!isBodyOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {/* <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isBodyOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg> */}
                Response Body
              </button>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Code */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColorMap[statusInfo.color]}`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-${statusInfo.color}-400 animate-pulse`}></div>
                  <span>{displayResponse.status} {displayResponse.statusText} </span>
                </div>

                {/* Time */}
                {displayResponse.time && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{Math.floor(displayResponse.time)}ms</span>
                  </div>
                )}

                {/* Size */}
                {displayResponse.size && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3 3h10c1.5 0 3-1 3-3V7c0-2-1.5-3-3-3H7c-1.5 0-3 1-3 3z M10 7h4" />
                    </svg>
                    <span>{displayResponse.size}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Response Content */}
        {displayResponse && (
          <div className={`transition-all duration-300 ease-in-out opacity-100`}>
            <div className="relative">
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-5 min-h-25 max-h-[50vh] text-sm font-mono overflow-auto rounded-b-2xl whitespace-pre-wrap break-all">
                <code className="language-json">
                  {(() => {
                    try {
                      const parsed = JSON.parse(displayResponse.data);
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return displayResponse.data;
                    }
                  })()}
                </code>
              </pre>

              {/* Copy Button - Floating */}
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 group flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg border border-gray-600/50"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!displayResponse && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9h8M8 13h6M9 18h6m-1-14H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No response yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Send a request to see the response here</p>
          </div>
        )}
      </div>
    </div>
  );
}