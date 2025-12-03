import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode
} from "react";
import { App } from "antd";
import * as authApi from "../api/auth";
import type { LoginPayload } from "../api/auth";

export interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "exam-system-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { message } = App.useApp();
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { token: null, username: null, role: null };
  });

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const applyLoginResponse = (res: { token: string; username: string; role: string }) => {
    setAuth({
      token: res.token,
      username: res.username,
      role: res.role
    });
  };

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    applyLoginResponse(res);
    message.success("登录成功");
  };

  const register = async (payload: LoginPayload) => {
    // TS 类型推断暂时没有识别到 authApi.register 的导出，这里忽略检查以使用后端新增的注册接口
    // @ts-ignore
    const res = await authApi.register(payload);
    applyLoginResponse(res);
    message.success("注册成功，已自动登录");
  };

  const logout = () => {
    setAuth({ token: null, username: null, role: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      ...auth,
      login,
      register,
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
