import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "@/Context/AuthContext";
import { UserModelInterface, Workspace } from "@/types/auth.type";
import { refreshTokenApi } from "@/services/authService";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserModelInterface | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

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
    const storedWorkspace = localStorage.getItem("AutoAPICurrentWorkspace");

    try {
      if (authUser && storedToken) {
        // Silently get a fresh access token using the httpOnly refresh token cookie.
        // This ensures the user isn't stuck with an expired token after returning to the app.
        try {
          const { data } = await refreshTokenApi();
          const freshToken: string = data.token;

          // Update localStorage and state with the fresh token
          localStorage.setItem("AutoAPIAuthToken", freshToken);
          setToken(freshToken);
        } catch {
          // Refresh failed — the refresh token has expired or been revoked.
          // Log the user out cleanly.
          logout();
          return;
        }

        setUser(JSON.parse(authUser));
        if (storedWorkspace) {
          setCurrentWorkspace(JSON.parse(storedWorkspace));
        }
      }
    } catch (error) {
      console.error("Error restoring session:", error);
      logout();
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
