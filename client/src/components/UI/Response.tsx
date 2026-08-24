import { useState, useMemo, ReactNode } from 'react';
import {
  Download,
  Copy,
  Check,
  Loader2,
  ImageOff,
  VideoOff,
  FileWarning,
  FileArchive,
  Inbox,
  Cookie as CookieIcon,
} from 'lucide-react';
import { DisplayResponse, Headers } from '@/types/types';

interface ResponseProps {
  displayResponse: DisplayResponse | null;
  loading: boolean;
}

type TabId = 'body' | 'headers' | 'cookies';

const TABS: { id: TabId; label: string }[] = [
  { id: 'body', label: 'Body' },
  { id: 'headers', label: 'Headers' },
  { id: 'cookies', label: 'Cookies' },
];

type StatusColor = 'green' | 'yellow' | 'red' | 'gray';

const formatStatus = (status: number): { text: string; color: StatusColor } => {
  if (!status) return { text: 'No status', color: 'gray' };
  if (status >= 200 && status < 300) return { text: `${status} OK`, color: 'green' };
  if (status >= 300 && status < 400) return { text: `${status} Redirect`, color: 'yellow' };
  if (status >= 400 && status < 500) return { text: `${status} Client Error`, color: 'red' };
  return { text: `${status} Server Error`, color: 'red' };
};

// Explicit maps — Tailwind can't resolve `bg-${color}-400` template strings at build time.
const statusPillMap: Record<StatusColor, string> = {
  green: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  red: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
};

const statusDotMap: Record<StatusColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
};

type BodyKind = 'json' | 'image' | 'video' | 'pdf' | 'binary' | 'text';

const getContentType = (headers: Headers): string => (headers['content-type'] ?? '').toLowerCase();

const getBodyKind = (contentType: string): BodyKind => {
  if (!contentType) return 'text';
  if (contentType.includes('application/json')) return 'json';
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.includes('application/pdf')) return 'pdf';
  if (
    contentType.includes('zip') ||
    contentType.includes('octet-stream') ||
    contentType.includes('application/x-') ||
    contentType.includes('application/vnd.')
  ) {
    return 'binary';
  }
  return 'text';
};

const extensionForContentType = (contentType: string): string => {
  if (contentType.includes('json')) return 'json';
  if (contentType.includes('pdf')) return 'pdf';
  if (contentType.includes('zip')) return 'zip';
  if (contentType.startsWith('image/')) return contentType.split('/')[1] ?? 'png';
  if (contentType.startsWith('video/')) return contentType.split('/')[1] ?? 'mp4';
  return 'txt';
};

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface ParsedCookie {
  name: string;
  value: string;
  attrs: string[];
}

// Splits on commas that start a new "name=value" pair, since Set-Cookie's own
// Expires attribute also contains a comma (e.g. "Expires=Wed, 21 Oct").
const parseCookiesFromHeader = (raw?: string): ParsedCookie[] => {
  if (!raw) return [];
  return raw
    .split(/,(?=\s*[^;,=\s]+=)/)
    .map((str) => str.trim())
    .filter(Boolean)
    .map((str) => {
      const parts = str.split(';').map((p) => p.trim());
      const [name, ...rest] = parts[0].split('=');
      return {
        name: name?.trim() ?? '',
        value: rest.join('=').trim(),
        attrs: parts.slice(1),
      };
    });
};

const getCookies = (displayResponse: DisplayResponse): ParsedCookie[] => {
  const fromHeader = parseCookiesFromHeader(
    displayResponse.headers['set-cookie'] ?? displayResponse.headers['Set-Cookie'],
  );
  if (fromHeader.length > 0) return fromHeader;

  if (displayResponse.cookies) {
    return Object.entries(displayResponse.cookies).map(([name, value]) => ({
      name,
      value,
      attrs: [],
    }));
  }
  return [];
};

export default function Response({ displayResponse, loading }: ResponseProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('body');

  const contentType = displayResponse ? getContentType(displayResponse.headers) : '';
  const bodyKind = getBodyKind(contentType);
  const statusInfo = displayResponse ? formatStatus(displayResponse.status) : formatStatus(0);

  const headerEntries = useMemo((): [string, string][] => {
    if (!displayResponse) return [];
    return Object.entries(displayResponse.headers).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    );
  }, [displayResponse]);

  const cookies = useMemo((): ParsedCookie[] => {
    if (!displayResponse) return [];
    return getCookies(displayResponse);
  }, [displayResponse]);

  const prettyBody = useMemo(() => {
    if (!displayResponse) return '';
    if (bodyKind !== 'json') return displayResponse.data;
    try {
      return JSON.stringify(JSON.parse(displayResponse.data), null, 2);
    } catch {
      return displayResponse.data;
    }
  }, [displayResponse, bodyKind]);

  const handleCopy = () => {
    if (!displayResponse) return;
    navigator.clipboard
      .writeText(prettyBody)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error('Failed to copy:', err));
  };

  const handleDownload = (): void => {
    if (!displayResponse) return;
    const ext = extensionForContentType(contentType);

    if (displayResponse.dataUrl) {
      const link = document.createElement('a');
      link.href = displayResponse.dataUrl;
      link.download = `response.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const blob = new Blob([displayResponse.data], { type: contentType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showSkeleton = loading && !displayResponse;
  const showOverlay = loading && !!displayResponse;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-purple-500 rounded-full" />
          <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Response</h2>
        </div>
        {displayResponse && activeTab === 'body' && (
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            Save
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden transition-colors duration-300">
        {/* Indeterminate progress line */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 overflow-hidden z-20">
            <div className="h-full w-1/3 bg-linear-to-r from-blue-500 to-purple-500 loading-bar-sweep" />
          </div>
        )}

        {/* Skeleton — first load, nothing to show yet */}
        {showSkeleton && (
          <div className="p-5 space-y-4 animate-pulse">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-lg bg-gray-100 dark:bg-gray-700" />
              <div className="h-6 w-16 rounded-lg bg-gray-100 dark:bg-gray-700" />
              <div className="h-6 w-16 rounded-lg bg-gray-100 dark:bg-gray-700" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
              <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-700" />
              <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-700" />
              <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">Sending request…</p>
          </div>
        )}

        {/* Response present (dimmed + overlay spinner if re-sending) */}
        {displayResponse && (
          <div className="relative">
            {showOverlay && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sending request…</span>
                </div>
              </div>
            )}

            <div className={showOverlay ? 'opacity-40 pointer-events-none' : ''}>
              {/* Tabs + status bar */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                  {/* Tabs */}
                  <div className="flex items-center gap-5">
                    {TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const count =
                        tab.id === 'headers' ? headerEntries.length :
                          tab.id === 'cookies' ? cookies.length :
                            undefined;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${isActive
                            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                          {tab.label}
                          {typeof count === 'number' && count > 0 && (
                            <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-2 pb-2.5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusPillMap[statusInfo.color]}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusDotMap[statusInfo.color]}`} />
                      <span>{statusInfo.text}</span>
                    </div>

                    {displayResponse.time > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <span>{Math.round(displayResponse.time)} ms</span>
                      </div>
                    )}

                    {displayResponse.size > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                        <span>{formatBytes(displayResponse.size)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab content */}
              {activeTab === 'body' && (
                <BodyPanel
                  bodyKind={bodyKind}
                  prettyBody={prettyBody}
                  dataUrl={displayResponse.dataUrl}
                  contentType={contentType}
                  size={displayResponse.size}
                  copied={copied}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              )}

              {activeTab === 'headers' && <HeadersPanel entries={headerEntries} />}

              {activeTab === 'cookies' && <CookiesPanel cookies={cookies} />}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!displayResponse && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
              <Inbox className="w-9 h-9 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No response yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Send a request to see the response here</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading-bar-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .loading-bar-sweep {
          animation: loading-bar-sweep 1.1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/* ---------- Body panel: content-type aware ---------- */

function BodyPanel({
  bodyKind,
  prettyBody,
  dataUrl,
  contentType,
  size,
  copied,
  onCopy,
  onDownload,
}: {
  bodyKind: BodyKind;
  prettyBody: string;
  dataUrl?: string;
  contentType: string;
  size: number;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  // Terminal-style console — dark regardless of app theme (matches Postman/DevTools convention).
  const ConsoleShell = ({ children }: { children: ReactNode }) => (
    <div className="relative">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 dark:bg-gray-950 border-b border-gray-800">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-[11px] text-gray-500 font-mono">{contentType || 'text/plain'}</span>
      </div>
      {children}
    </div>
  );

  if (bodyKind === 'json' || bodyKind === 'text') {
    return (
      <ConsoleShell>
        <div className="relative">
          <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-5 min-h-25 max-h-[50vh] text-sm font-mono overflow-auto whitespace-pre-wrap break-all">
            <code>{prettyBody}</code>
          </pre>
          <button
            onClick={onCopy}
            className="absolute top-3 right-3 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg border border-gray-600/50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </ConsoleShell>
    );
  }

  if (bodyKind === 'image') {
    return (
      <ConsoleShell>
        <div
          className="flex items-center justify-center p-8 min-h-50 max-h-[55vh] overflow-auto"
          style={{
            backgroundImage: 'repeating-conic-gradient(#2a2a2e 0% 25%, #1f1f23 0% 50%)',
            backgroundSize: '16px 16px',
          }}
        >
          {dataUrl ? (
            <img src={dataUrl} alt="Response preview" className="max-h-[48vh] max-w-full object-contain rounded-lg shadow-lg" />
          ) : (
            <UnavailablePreview icon={<ImageOff className="w-8 h-8 text-gray-600" />} label="Image preview unavailable" />
          )}
        </div>
      </ConsoleShell>
    );
  }

  if (bodyKind === 'video') {
    return (
      <ConsoleShell>
        <div className="flex items-center justify-center p-6 bg-black min-h-50 max-h-[55vh]">
          {dataUrl ? (
            <video src={dataUrl} controls className="max-h-[48vh] max-w-full rounded-lg" />
          ) : (
            <UnavailablePreview icon={<VideoOff className="w-8 h-8 text-gray-600" />} label="Video preview unavailable" />
          )}
        </div>
      </ConsoleShell>
    );
  }

  if (bodyKind === 'pdf') {
    return (
      <ConsoleShell>
        {dataUrl ? (
          <iframe src={dataUrl} className="w-full h-[55vh] bg-white" title="PDF response preview" />
        ) : (
          <div className="p-8 min-h-40 flex items-center justify-center">
            <UnavailablePreview icon={<FileWarning className="w-8 h-8 text-gray-600" />} label="PDF preview unavailable" />
          </div>
        )}
      </ConsoleShell>
    );
  }

  // binary / zip / anything else — no inline preview, offer a clean download card
  return (
    <ConsoleShell>
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 bg-gray-900 dark:bg-gray-950">
        <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center">
          <FileArchive className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-300 text-sm font-medium">{contentType || 'Binary file'}</p>
        <p className="text-gray-500 text-xs">{formatBytes(size)} · no inline preview for this file type</p>
        <button
          onClick={onDownload}
          disabled={!dataUrl}
          className="mt-1 inline-flex items-center gap-x-1.5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download file
        </button>
      </div>
    </ConsoleShell>
  );
}

function UnavailablePreview({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {icon}
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ---------- Headers panel ---------- */

function HeadersPanel({ entries }: { entries: [string, string][] }) {
  if (entries.length === 0) {
    return <EmptyPanelState icon={<Inbox className="w-6 h-6 text-gray-300 dark:text-gray-600" />} label="No headers returned for this response." />;
  }
  return (
    <div className="max-h-[50vh] overflow-auto">
      {entries.map(([key, value], i) => (
        <div
          key={`${key}-${i}`}
          className="flex items-start gap-4 px-5 py-2.5 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="w-48 shrink-0 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 pt-0.5">{key}</span>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Cookies panel ---------- */

function CookiesPanel({ cookies }: { cookies: ParsedCookie[] }) {
  if (cookies.length === 0) {
    return <EmptyPanelState icon={<CookieIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />} label="No cookies were set by this response." />;
  }
  return (
    <div className="max-h-[50vh] overflow-auto p-4 space-y-2.5">
      {cookies.map((cookie, i) => (
        <div
          key={`${cookie.name}-${i}`}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3"
        >
          <div className="text-xs font-mono">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{cookie.name}</span>
            <span className="text-gray-400 dark:text-gray-500"> = </span>
            <span className="text-gray-600 dark:text-gray-300 break-all">{cookie.value}</span>
          </div>
          {cookie.attrs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {cookie.attrs.map((attr, j) => (
                <span
                  key={j}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  {attr}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyPanelState({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 px-5 text-center">
      {icon}
      <p className="text-gray-400 dark:text-gray-500 text-xs">{label}</p>
    </div>
  );
}