// AuthenticationWidget.tsx
import { useEffect, useState } from 'react';
import { Eye, EyeOff, ShieldOff } from 'lucide-react';
import { HeaderItem } from '@/types/types';
import CustomSelect from "@/components/UI/Customselect";

export type AuthType = 'No Auth' | 'Basic Auth' | 'Bearer Token';

export interface AuthState {
  type: AuthType;
  username: string;
  password: string;
  token: string;
}

export const defaultAuthState: AuthState = {
  type: 'No Auth',
  username: '',
  password: '',
  token: '',
};

interface AuthenticationWidgetProps {
  header: HeaderItem[];
  setHeader: React.Dispatch<React.SetStateAction<HeaderItem[]>>;
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const AUTH_METHODS: AuthType[] = ['No Auth', 'Basic Auth', 'Bearer Token'];

const AuthenticationWidget: React.FC<AuthenticationWidgetProps> = ({ setHeader, auth, setAuth }) => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let authValue: string | null = null;

    if (auth.type === 'Basic Auth' && (auth.username || auth.password)) {
      authValue = `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
    } else if (auth.type === 'Bearer Token' && auth.token) {
      authValue = `Bearer ${auth.token}`;
    }

    setHeader((prev) => {
      // match by `source`, not by key name — so a header a user manually
      // names "Authorization" is never silently overwritten by this effect
      const withoutAuth = prev.filter((h) => h.source !== 'auth');
      if (!authValue) return withoutAuth;
      return [
        ...withoutAuth,
        { id: crypto.randomUUID(), key: 'Authorization', value: authValue, enabled: true, source: 'auth' },
      ];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.type, auth.username, auth.password, auth.token]);

  return (
    <div className="flex items-stretch rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-h-45.5 max-h-45.5 mt-2">
      {/* Left: auth type dropdown */}
      <div className="shrink-0 w-44 px-4 py-4">
        <label className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Auth Type
        </label>

        <CustomSelect
          value={auth.type}
          onChange={(m) => setAuth((prev) => ({ ...prev, type: m }))}
          options={AUTH_METHODS}
          buttonClassName="flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500"
          buttonOpenClassName="border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-300"
          dropdownClassName="top-11 left-0 w-44 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden"
          optionClassName="px-3 py-2 text-sm cursor-pointer transition-colors duration-100"
          optionSelectedClassName="bg-indigo-600 text-white"
          optionUnselectedClassName="text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700"
        />

        {auth.type !== 'No Auth' && (
          <p className="mt-3 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            Adds an <code className="font-mono text-gray-500 dark:text-gray-400">Authorization</code> header to this
            request.
          </p>
        )}
      </div>

      <div className="w-px bg-gray-200 dark:bg-gray-700 my-4" />

      <div className="flex-1 px-5 py-4 min-w-0">
        {auth.type === 'No Auth' && (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center gap-2">
            <ShieldOff size={22} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
              This request does not use any authorization.
            </p>
          </div>
        )}

        {auth.type === 'Basic Auth' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={auth.username}
                onChange={(e) => setAuth((prev) => ({ ...prev, username: e.target.value }))}
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
                  value={auth.password}
                  onChange={(e) => setAuth((prev) => ({ ...prev, password: e.target.value }))}
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

        {auth.type === 'Bearer Token' && (
          <div className="max-w-md">
            <label className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
              Token
            </label>
            <input
              type="text"
              value={auth.token}
              onChange={(e) => setAuth((prev) => ({ ...prev, token: e.target.value }))}
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