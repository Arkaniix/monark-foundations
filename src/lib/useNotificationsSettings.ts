import { useCallback, useEffect, useRef, useState } from "react";
import { fetchNotificationsSettings, patchNotificationsSettings } from "./api/settings";

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

export function useNotificationsSettings() {
  const [settings, setSettings] = useState<NotificationsSettings>(DEFAULT_NOTIFICATIONS_SETTINGS);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    fetchNotificationsSettings()
      .then((s) => {
        if (!alive) return;
        setSettings({
          channels: { ...DEFAULT_NOTIFICATIONS_SETTINGS.channels, ...(s?.channels ?? {}) },
          events: { ...DEFAULT_NOTIFICATIONS_SETTINGS.events, ...(s?.events ?? {}) },
          frequency: s?.frequency ?? DEFAULT_NOTIFICATIONS_SETTINGS.frequency,
        });
      })
      .catch(() => { /* on garde les defaults en cas d'échec */ })
      .finally(() => { if (alive) { setLoading(false); hydrated.current = true; } });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void patchNotificationsSettings(settings).catch(() => { /* silencieux */ });
    }, 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
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

  return { settings, loading, updateChannel, updateEvent, setFrequency };
}
