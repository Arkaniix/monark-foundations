import {
  apiFetch,
  setTokens,
  clearTokens,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ForgotPasswordResponse,
  type User,
} from "./client";
import { ENDPOINTS } from "./endpoints";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>(ENDPOINTS.LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(res.access_token, res.refresh_token);
  return res;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await apiFetch<RegisterResponse>(ENDPOINTS.REGISTER, {
    method: "POST",
    body: JSON.stringify(data),
  });
  setTokens(res.access_token, res.refresh_token);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>(ENDPOINTS.LOGOUT, { method: "POST" });
  } catch {
    // best effort
  }
  clearTokens();
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return apiFetch<ForgotPasswordResponse>(ENDPOINTS.FORGOT_PASSWORD, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>(ENDPOINTS.ME, { method: "GET" });
}