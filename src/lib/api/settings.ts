import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { NotificationsSettings } from "../useNotificationsSettings";

interface ApiUserSettings {
  notifications: NotificationsSettings;
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