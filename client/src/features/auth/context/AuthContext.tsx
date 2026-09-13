import * as React from "react";
import { ROLES, type Role } from "@/app/config/roles";

const AUTH_STORAGE_KEY = "skeletor-auth";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role?: Role) => void;
  logout: () => void;
}

function loadStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, role: null, isAuthenticated: false };
    const user = JSON.parse(raw) as AuthUser;
    if (!user?.id || !user?.email || !user?.role) {
      return { user: null, role: null, isAuthenticated: false };
    }
    return {
      user,
      role: user.role,
      isAuthenticated: true,
    };
  } catch {
    return { user: null, role: null, isAuthenticated: false };
  }
}

function saveAuth(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(loadStoredAuth);

  const login = React.useCallback(
    (email: string, _password: string, role: Role = ROLES.USER) => {
      const user: AuthUser = {
        id: crypto.randomUUID(),
        email,
        role,
      };
      saveAuth(user);
      setState({
        user,
        role: user.role,
        isAuthenticated: true,
      });
    },
    []
  );

  const logout = React.useCallback(() => {
    saveAuth(null);
    setState({ user: null, role: null, isAuthenticated: false });
  }, []);

  const value: AuthContextValue = React.useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
