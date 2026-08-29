// client/srccomponents/UI/Response/Panels/BodyPanel
import { Highlight, themes } from 'prism-react-renderer';
import { ReactNode } from 'react';
import {
  Download,
  // Copy,
  // Check,
  ImageOff,
  VideoOff,
  FileWarning,
  FileArchive,
} from 'lucide-react';

type BodyKind = 'json' | 'image' | 'video' | 'pdf' | 'binary' | 'text' | 'html';

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


function UnavailablePreview({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {icon}
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function BodyPanel({
  bodyKind,
  prettyBody,
  dataUrl,
  contentType,
  size,
  // copied,
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
    <div className="relative bg-gray-900">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-[11px] text-gray-500 font-mono">{contentType || 'text/plain'}</span>
      </div>
      {children}
    </div>
  );

  if (bodyKind === 'json' || bodyKind === 'html') {
    const language = bodyKind === 'html' ? 'markup' : 'json';
    return (
      <ConsoleShell>
        <div className="relative">
          <CodeBlock code={prettyBody} language={language} />
          <button onClick={onCopy} className="absolute top-3 right-3 ...">
            {/* copy button unchanged */}
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

function CodeBlock({ code, language }: { code: string; language: 'json' | 'markup' }) {
  return (
    <Highlight theme={themes.vsDark} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} p-5 min-h-25 max-h-[50vh] text-sm font-mono overflow-y-auto overflow-x-hidden whitespace-pre-wrap wrap-break-word`}
          style={{ ...style, background: 'transparent', color: '#d4d4d4' }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="whitespace-pre-wrap wrap-break-word">
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} className="whitespace-pre-wrap wrap-break-word" />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}