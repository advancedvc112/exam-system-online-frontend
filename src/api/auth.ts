import http from "./http";

export type UserRole = "admin" | "teacher" | "student";

export interface LoginPayload {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: UserRole;
}

/**
 * 登录接口
 */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await http.post("/exam-online/auth/login", payload);
  return data.data ?? data;
};

/**
 * 注册接口（后端会直接返回登录信息，相当于注册并自动登录）
 */
export const register = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const { data } = await http.post("/exam-online/auth/register", payload);
  return data.data ?? data;
};
