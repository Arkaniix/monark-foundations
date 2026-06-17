/**
 * Mock implementation de authApi.
 *
 * Honore EXACTEMENT les signatures de src/lib/api/auth.ts :
 *   - login(email, password)      → Promise<LoginResponse>
 *   - register(data)              → Promise<RegisterResponse>
 *   - logout()                    → Promise<void>
 *   - forgotPassword(email)       → Promise<ForgotPasswordResponse>
 *   - getMe()                     → Promise<User>
 *
 * Côté consommateur (AuthContext, futures pages), aucune différence visible :
 * authApi.xxx() retourne la même structure de données.
 *
 * Comportement :
 *   - login accepte n'importe quel couple email/password (objectif : débloquer
 *     la preview, pas simuler de l'auth). Set des tokens fake dans localStorage.
 *   - register set tokens + retourne MOCK_USER (l'email passé en argument est
 *     ignoré, on retourne toujours MOCK_USER).
 *   - getMe vérifie qu'un access token est présent dans localStorage (simule
 *     un endpoint protégé). Si absent, throw ApiException 401 — exactement
 *     comme le ferait le vrai backend.
 *   - logout clear les tokens.
 *   - forgotPassword est un no-op qui simule un succès après delay.
 */

import {
  ApiException,
  getAccessToken,
  setTokens,
  clearTokens,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ForgotPasswordResponse,
  type User,
} from "../api/client";
import { MOCK_USER, MOCK_TOKENS, mockDelay } from "./fixtures";

export async function login(_email: string, _password: string): Promise<LoginResponse> {
  await mockDelay();
  setTokens(MOCK_TOKENS.access, MOCK_TOKENS.refresh);
  return {
    access_token: MOCK_TOKENS.access,
    refresh_token: MOCK_TOKENS.refresh,
    token_type: "Bearer",
    expires_in: 3600,
  };
}

export async function register(_data: RegisterRequest): Promise<RegisterResponse> {
  await mockDelay();
  setTokens(MOCK_TOKENS.access, MOCK_TOKENS.refresh);
  return {
    access_token: MOCK_TOKENS.access,
    refresh_token: MOCK_TOKENS.refresh,
    user: MOCK_USER,
  };
}

export async function logout(): Promise<void> {
  await mockDelay(150);
  clearTokens();
}

export async function forgotPassword(_email: string): Promise<ForgotPasswordResponse> {
  await mockDelay();
  return {
    ok: true,
    message: "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.",
  };
}

export async function resetPassword(_token: string, _newPassword: string): Promise<{ message: string }> {
  // mock : succès simulé, aligné sur le forgotPassword mock de ce fichier
  await mockDelay();
  return { message: "Password has been reset successfully." };
}

export async function verifyEmail(_token: string): Promise<{ message: string }> {
  // mock : succès simulé, aligné sur le resetPassword mock de ce fichier
  await mockDelay();
  return { message: "Email verified successfully." };
}

export async function resendVerification(): Promise<{ message: string }> {
  await mockDelay();
  return { message: "Verification email sent." };
}

export async function getMe(): Promise<User> {
  await mockDelay(200);
  const token = getAccessToken();
  if (!token) {
    throw new ApiException(401, "Unauthorized — no access token", "UNAUTHORIZED");
  }
  return MOCK_USER;
}

export async function deleteAccount(): Promise<void> {
  await mockDelay(200);
}

export async function restoreAccount(): Promise<void> {
  await mockDelay(200);
}
