import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "@/Context/AuthContext";
import { UserModelInterface, Workspace } from "@/types/auth.type";

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

    // window.location.href = "/signup";
  };

  const fetchUserData = async () => {
    const authUser = localStorage.getItem("AutoAPIUserData");
    const tclAuthToken = localStorage.getItem("AutoAPIAuthToken");
    const currentWorkspace = localStorage.getItem("AutoAPICurrentWorkspace");

    try {
      if (authUser && tclAuthToken) {
        setUser(JSON.parse(authUser));
        setToken(tclAuthToken);
        if (currentWorkspace) {
          setCurrentWorkspace(JSON.parse(currentWorkspace));
        }
      }
    } catch (error) {
      console.error("Error parsing authUser:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, currentWorkspace, loading, login, logout, fetchUserData, setCurrentWorkspace }}
    >
      {children}
    </AuthContext.Provider>
  );
};
