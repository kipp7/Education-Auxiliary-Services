import React from "react";
import { AdminUser, getToken, getUser, setToken, setUser } from "./auth";

type AuthState = {
  token: string | null;
  user: AdminUser | null;
  loginDev: (displayName: string) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(() => getToken());
  const [user, setUserState] = React.useState<AdminUser | null>(() => getUser());

  const loginDev = React.useCallback((displayName: string) => {
    const newToken = "dev-token";
    const newUser: AdminUser = {
      id: "dev",
      displayName: displayName.trim() || "管理员",
      roles: ["admin"],
      permissions: [
        "admin:access",
        "question-bank:read",
        "question-bank:write",
        "import:read",
        "import:write",
        "cms:read",
        "cms:write",
        "svip:read",
        "svip:write",
        "dashboard:read",
        "banner:read",
        "banner:write",
        "course:read",
        "course:write",
      ],
    };

    setToken(newToken);
    setUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  }, []);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    setTokenState(null);
    setUserState(null);
  }, []);

  const value = React.useMemo<AuthState>(
    () => ({ token, user, loginDev, logout }),
    [loginDev, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

