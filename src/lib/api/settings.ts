import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { NotificationsSettings } from "../useNotificationsSettings";
import type { AccountingSettings } from "../useAccountingSettings";

interface ApiUserSettings {
  notifications: NotificationsSettings;
  accounting: AccountingSettings;
}

export async function fetchNotificationsSettings(): Promise<NotificationsSettings> {
  const data = await apiFetch<ApiUserSettings>(ENDPOINTS.USER_SETTINGS, { method: "GET" });
  return data.notifications;
}

export async function patchNotificationsSettings(
  notifications: NotificationsSettings,
): Promise<void> {
  await apiFetch<ApiUserSettings>(ENDPOINTS.USER_SETTINGS, {
    method: "PATCH",
    body: JSON.stringify({ notifications }),
  });
}

export async function fetchAccountingSettings(): Promise<AccountingSettings> {
  const data = await apiFetch<{ accounting: AccountingSettings }>(
    ENDPOINTS.USER_SETTINGS,
    { method: "GET" },
  );
  return data.accounting;
}

export async function patchAccountingSettings(
  accounting: AccountingSettings,
): Promise<void> {
  await apiFetch<unknown>(ENDPOINTS.USER_SETTINGS, {
    method: "PATCH",
    body: JSON.stringify({ accounting }),
  });
}