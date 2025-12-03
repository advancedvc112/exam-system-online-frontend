import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode
} from "react";
import { message } from "antd";
import { login as loginApi, LoginPayload } from "../api/auth";

export interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "exam-system-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { token: null, username: null, role: null };
  });

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    setAuth({
      token: res.token,
      username: res.username,
      role: res.role
    });
    message.success("登录成功");
  };

  const logout = () => {
    setAuth({ token: null, username: null, role: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      ...auth,
      login,
      logout
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

