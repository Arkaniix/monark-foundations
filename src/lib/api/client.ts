const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.monark-market.fr";
const ACCESS_KEY = "monark_access_token";
const REFRESH_KEY = "monark_refresh_token";

export class ApiException extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}
export function setTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = {
  email: string;
  password: string;
  full_name?: string;
  signup_plan?: "free" | "standard" | "pro";
};
export type User = {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  subscription_tier: "free" | "standard" | "pro";
  credits_remaining: number;
  pending_deletion?: boolean;
  deletion_scheduled_at?: string | null;
};
export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
};
export type RegisterResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};
export type ForgotPasswordRequest = { email: string };
export type ForgotPasswordResponse = { ok: true; message: string };

function buildHeaders(init: RequestInit | undefined, token: string | null): Headers {
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return headers;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { access_token: string; refresh_token: string };
    setTokens(body.access_token, body.refresh_token);
    return true;
  } catch {
    return false;
  }
}
const MAX_RETRIES_429 = 3;

const RETRY_DELAY_CAP_MS = 6000; // borne UX : ne jamais geler l'UI plus de ~6 s par tentative

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Délai avant retry sur 429. Priorité au header `Retry-After` (en secondes)
 * renvoyé par l'API ; à défaut, backoff exponentiel avec jitter.
 */
function retryDelayMs(res: Response, attempt: number): number {
  const header = res.headers.get("Retry-After");
  if (header) {
    const secs = Number(header);
    if (Number.isFinite(secs) && secs >= 0) return Math.min(secs * 1000, RETRY_DELAY_CAP_MS);
  }
  return 500 * 2 ** attempt + Math.random() * 250; // 500 / 1000 / 2000 ms + jitter
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const doRequest = () => fetch(url, { ...init, headers: buildHeaders(init, getAccessToken()) });

  let res = await doRequest();

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doRequest();
    }
  }

  // Rate-limit (429) : la requête est rejetée AVANT traitement → retry sûr pour
  // toutes les méthodes. On respecte Retry-After si présent, sinon backoff
  // exponentiel jitter (~500 ms → 1 s → 2 s), 3 tentatives max.
  for (let attempt = 0; res.status === 429 && attempt < MAX_RETRIES_429; attempt++) {
    await sleep(retryDelayMs(res, attempt));
    res = await doRequest();
  }

  if (!res.ok) {
    let body: { message?: string; detail?: string; code?: string; details?: unknown } = {};
    try {
      body = await res.json();
    } catch {
      // not json
    }
    throw new ApiException(res.status, body.detail || body.message || res.statusText, body.code, body.details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}