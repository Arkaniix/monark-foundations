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

/**
 * Forme RÉELLE renvoyée par l'API sur /v1/users/me et /v1/auth/register.
 * Diffère du type front `User` : l'API expose `role` / `display_name` / `username`
 * et n'expose PAS `subscription_tier`, `full_name` ni `credits_remaining`.
 */
interface ApiUser {
  id: number;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  default_region: string | null;
  default_currency: string | null;
  role: string; // "admin" | "free" | "standard" | "pro" | ...
  is_active: boolean;
  marketing_opt_in: boolean;
  created_at: string;
  last_login: string | null;
}

/** Mappe `role` API → `subscription_tier` front (union stricte free/standard/pro). */
function roleToTier(role: string): User["subscription_tier"] {
  switch (role) {
    case "pro":
    case "admin": // admin = accès complet → traité comme pro côté UI
      return "pro";
    case "standard":
      return "standard";
    case "free":
    default:
      return "free";
  }
}

/**
 * Mappe la réponse réelle vers le type `User` du front.
 * `credits_remaining` n'existe pas sur /v1/users/me → il est passé séparément
 * (récupéré depuis le dashboard) ; fallback 0.
 */
function mapUser(u: ApiUser, creditsRemaining: number): User {
  return {
    id: String(u.id),
    email: u.email,
    full_name: u.display_name ?? u.username ?? undefined,
    created_at: u.created_at,
    subscription_tier: roleToTier(u.role),
    credits_remaining: creditsRemaining,
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>(ENDPOINTS.LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(res.access_token, res.refresh_token);
  return res;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  // L'API register CRÉE le compte mais renvoie l'objet user à plat, SANS tokens.
  // On enchaîne donc un login automatique pour ouvrir la session (pose les tokens).
  await apiFetch<ApiUser>(ENDPOINTS.REGISTER, {
    method: "POST",
    body: JSON.stringify(data),
  });
  const tokens = await login(data.email, data.password); // setTokens à l'intérieur
  const user = await getMe();
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    user,
  };
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
  const raw = await apiFetch<ApiUser>(ENDPOINTS.ME, { method: "GET" });
  // Les crédits ne sont pas sur /users/me → on les lit sur le dashboard (best effort).
  let credits = 0;
  try {
    const overview = await apiFetch<{ credits?: { balance?: number } }>(
      ENDPOINTS.DASHBOARD_OVERVIEW,
      { method: "GET" },
    );
    credits = overview.credits?.balance ?? 0;
  } catch {
    // si le dashboard échoue, on connecte quand même l'utilisateur avec 0 crédit affiché
  }
  return mapUser(raw, credits);
}
