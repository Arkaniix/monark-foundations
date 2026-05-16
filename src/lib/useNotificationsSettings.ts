import { useCallback, useEffect, useState } from "react";

export type NotificationFrequency = "instant" | "daily" | "weekly";

export type NotificationChannels = {
  email: boolean;
  in_app: boolean;
};

export type NotificationEvents = {
  watchlist_price_alerts: boolean;
  catalog_price_alerts: boolean;
  market_opportunities: boolean;
  weekly_summary: boolean;
};

export type NotificationsSettings = {
  channels: NotificationChannels;
  events: NotificationEvents;
  frequency: NotificationFrequency;
};

export const DEFAULT_NOTIFICATIONS_SETTINGS: NotificationsSettings = {
  channels: { email: false, in_app: true },
  events: {
    watchlist_price_alerts: true,
    catalog_price_alerts: true,
    market_opportunities: false,
    weekly_summary: true,
  },
  frequency: "daily",
};

const KEY = "monark.settings.notifications.v1";

function isFrequency(v: unknown): v is NotificationFrequency {
  return v === "instant" || v === "daily" || v === "weekly";
}

function load(): NotificationsSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_NOTIFICATIONS_SETTINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_NOTIFICATIONS_SETTINGS;
    return {
      channels: {
        ...DEFAULT_NOTIFICATIONS_SETTINGS.channels,
        ...(parsed.channels ?? {}),
      },
      events: {
        ...DEFAULT_NOTIFICATIONS_SETTINGS.events,
        ...(parsed.events ?? {}),
      },
      frequency: isFrequency(parsed.frequency)
        ? parsed.frequency
        : DEFAULT_NOTIFICATIONS_SETTINGS.frequency,
    };
  } catch {
    return DEFAULT_NOTIFICATIONS_SETTINGS;
  }
}

function save(s: NotificationsSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function useNotificationsSettings() {
  const [settings, setSettings] = useState<NotificationsSettings>(() => load());

  useEffect(() => {
    save(settings);
  }, [settings]);

  const updateChannel = useCallback(
    (key: keyof NotificationChannels, value: boolean) =>
      setSettings((s) => ({
        ...s,
        channels: { ...s.channels, [key]: value },
      })),
    [],
  );

  const updateEvent = useCallback(
    (key: keyof NotificationEvents, value: boolean) =>
      setSettings((s) => ({
        ...s,
        events: { ...s.events, [key]: value },
      })),
    [],
  );

  const setFrequency = useCallback(
    (f: NotificationFrequency) => setSettings((s) => ({ ...s, frequency: f })),
    [],
  );

  return { settings, updateChannel, updateEvent, setFrequency };
}
