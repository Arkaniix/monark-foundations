export const ENDPOINTS = {
  LOGIN: "/v1/auth/login",
  REGISTER: "/v1/auth/register",
  REFRESH: "/v1/auth/refresh",
  LOGOUT: "/v1/auth/logout",
  FORGOT_PASSWORD: "/v1/auth/forgot_password",
  RESET_PASSWORD: "/v1/auth/reset_password",
  ME: "/v1/auth/me",
} as const;