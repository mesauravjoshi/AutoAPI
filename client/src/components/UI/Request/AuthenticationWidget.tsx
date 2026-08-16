// AuthenticationWidget.tsx
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, EyeOff, ShieldOff } from 'lucide-react';
import { HeaderItem } from '@/types/types';

interface ParamsWidgetProps {
  header: HeaderItem[];
  setHeader: React.Dispatch<React.SetStateAction<HeaderItem[]>>;
}

type AuthType = 'No Auth' | 'Basic Auth' | 'Bearer Token';

const AUTH_METHODS: AuthType[] = ['No Auth', 'Basic Auth', 'Bearer Token'];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const AuthenticationWidget: React.FC<ParamsWidgetProps> = ({ setHeader }) => {
  const [authType, setAuthType] = useState<AuthType>('No Auth');
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // keep the shared header list in sync with the computed Authorization value
  useEffect(() => {
    let authValue: string | null = null;

    if (authType === 'Basic Auth' && (username || password)) {
      authValue = `Basic ${btoa(`${username}:${password}`)}`;
    } else if (authType === 'Bearer Token' && token) {
      authValue = `Bearer ${token}`;
    }

    setHeader((prev) => {
      const withoutAuth = prev.filter((h) => h.key.toLowerCase() !== 'authorization');
      if (!authValue) return withoutAuth;
      return [
        ...withoutAuth,
        { id: crypto.randomUUID(), key: 'Authorization', value: authValue, enabled: true } as HeaderItem,
      ];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authType, username, password, token]);

  const handleSelect = (m: AuthType) => {
    setAuthType(m);
    setOpen(false);
  };

  return (
    <div className="flex items-stretch rounded-lg border border-gray-200 dark:border-gray-700   shadow-sm  min-h-45.5 max-h-45.5">
      {/* Left: auth type dropdown */}
      <div className="shrink-0 w-44 px-4 py-4">
        <label className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Auth Type
        </label>

        <div className="relative z-50" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={classNames(
              'flex items-center justify-between w-full cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150',
              open
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'
            )}
          >
            <span>{authType}</span>
            <ChevronDown
              size={14}
              className={classNames(
                'text-gray-400 transition-transform duration-150',
                open ? 'rotate-180' : ''
              )}
            />
          </button>

          {open && (
            <div className="absolute top-11 left-0 w-44 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1 overflow-hidden">
              {AUTH_METHODS.map((m) => (
                <div
                  key={m}
                  onClick={() => handleSelect(m)}
                  className={classNames(
                    'px-3 py-2 text-sm cursor-pointer transition-colors duration-100',
                    authType === m
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700'
                  )}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>

        {authType !== 'No Auth' && (
          <p className="mt-3 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            Adds an <code className="font-mono text-gray-500 dark:text-gray-400">Authorization</code> header to this
            request.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-200 dark:bg-gray-700 my-4" />

      {/* Right: dynamic auth fields */}
      <div className="flex-1 px-5 py-4 min-w-0">
        {authType === 'No Auth' && (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center gap-2">
            <ShieldOff size={22} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
              This request does not use any authorization.
            </p>
          </div>
        )}

        {authType === 'Basic Auth' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/40 px-3 py-2 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-150"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/40 px-3 py-2 pr-9 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {authType === 'Bearer Token' && (
          <div className="max-w-md">
            <label className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
              Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900/40 px-3 py-2 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-150"
            />
            <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              Sent as <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthenticationWidget;