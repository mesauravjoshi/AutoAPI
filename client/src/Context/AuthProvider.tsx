import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "@/Context/AuthContext";
import { UserModelInterface, Workspace } from "@/types/auth.type";
import { refreshTokenApi } from "@/services/authService";
import { AxiosError } from "axios";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserModelInterface | null>(() => {
    try {
      const stored = localStorage.getItem("AutoAPIUserData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("AutoAPIAuthToken")
  );

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(() => {
    try {
      const stored = localStorage.getItem("AutoAPICurrentWorkspace");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem("AutoAPIUserData") // has cache -> not "loading" in UX sense
      ? false
      : true;
  });

  const login = (data: { user: UserModelInterface; token: string; workspace: Workspace }) => {
    setUser(data.user);
    setToken(data.token);
    setCurrentWorkspace(data.workspace);
    localStorage.setItem("AutoAPIUserData", JSON.stringify(data.user));
    localStorage.setItem("AutoAPIAuthToken", data.token);
    localStorage.setItem("AutoAPICurrentWorkspace", JSON.stringify(data.workspace));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCurrentWorkspace(null);
    localStorage.removeItem("AutoAPIUserData");
    localStorage.removeItem("AutoAPIAuthToken");
    localStorage.removeItem("AutoAPICurrentWorkspace");
  };

  const fetchUserData = async () => {
    const authUser = localStorage.getItem("AutoAPIUserData");
    const storedToken = localStorage.getItem("AutoAPIAuthToken");

    // No cache at all -> nothing to refresh, nothing to hydrate. Resolve immediately.
    if (!authUser || !storedToken) {
      setLoading(false);
      return;
    }

    // We already rendered optimistically with cached user/token above.
    // This just silently reconciles with the server in the background.
    try {
      const { data } = await refreshTokenApi();
      localStorage.setItem("AutoAPIAuthToken", data.token);
      setToken(data.token);
    } catch (err) {
      const error = err as AxiosError<any>;

      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          console.log("Session invalid, logging out");
          logout();
        }
        return;
      }

      if (error.request) {
        console.error("Network Error:", error.message);
        // Optional: don't log out on pure network failure —
        // let the user keep working offline with the cached token
        return;
      }

      console.error("Unexpected Error:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const updateCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem("AutoAPICurrentWorkspace", JSON.stringify(workspace));
  };

  const updateUser = (patch: Partial<UserModelInterface>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem("AutoAPIUserData", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, currentWorkspace, loading, login, logout, fetchUserData, setCurrentWorkspace, updateCurrentWorkspace, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
