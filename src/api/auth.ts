import http from "./http";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await http.post("/exam-online/auth/login", payload);
  return data.data ?? data;
};

