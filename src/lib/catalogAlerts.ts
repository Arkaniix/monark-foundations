import { useCallback, useEffect, useState } from "react";

const KEY_V1 = "monark.catalog.alerts.v1";
const KEY_V2 = "monark.catalog.alerts.v2";

export const ALERT_THRESHOLD_PCT = 5;

export type AlertEntry = {
  id: string;
  snapshot_eur: number | null;
  snapshot_at: string;
};

export type AlertDelta = {
  pct: number;
  direction: "up" | "down" | "flat";
  isSignificant: boolean;
};

function load(): AlertEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const rawV2 = window.localStorage.getItem(KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (x): x is AlertEntry =>
            x != null &&
            typeof x === "object" &&
            typeof x.id === "string" &&
            (typeof x.snapshot_eur === "number" || x.snapshot_eur === null) &&
            typeof x.snapshot_at === "string",
        );
      }
    }
    const rawV1 = window.localStorage.getItem(KEY_V1);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      if (Array.isArray(parsedV1)) {
        const nowIso = new Date().toISOString();
        const migrated: AlertEntry[] = parsedV1
          .filter((x): x is string => typeof x === "string")
          .map((id) => ({ id, snapshot_eur: null, snapshot_at: nowIso }));
        window.localStorage.setItem(KEY_V2, JSON.stringify(migrated));
        return migrated;
      }
    }
    return [];
  } catch {
    return [];
  }
}

function save(entries: AlertEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_V2, JSON.stringify(entries));
  } catch {
    /* noop */
  }
}

export function useCatalogAlerts() {
  const [entries, setEntries] = useState<AlertEntry[]>(() => load());

  useEffect(() => {
    save(entries);
  }, [entries]);

  const ids = entries.map((e) => e.id);

  const toggle = useCallback((id: string, currentMedian?: number) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.id === id);
      if (existing) {
        return prev.filter((e) => e.id !== id);
      }
      return [
        ...prev,
        {
          id,
          snapshot_eur: typeof currentMedian === "number" ? currentMedian : null,
          snapshot_at: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const getSnapshot = useCallback(
    (id: string): AlertEntry | null => entries.find((e) => e.id === id) ?? null,
    [entries],
  );

  const backfillSnapshot = useCallback((id: string, currentMedian: number) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id && e.snapshot_eur === null
          ? { ...e, snapshot_eur: currentMedian }
          : e,
      ),
    );
  }, []);

  return { ids, entries, toggle, has, getSnapshot, backfillSnapshot };
}

export function computeAlertDelta(
  snapshot: AlertEntry | null,
  currentMedian: number,
): AlertDelta | null {
  if (!snapshot || snapshot.snapshot_eur === null || snapshot.snapshot_eur === 0) {
    return null;
  }
  const pct = ((currentMedian - snapshot.snapshot_eur) / snapshot.snapshot_eur) * 100;
  const direction: AlertDelta["direction"] =
    pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat";
  return {
    pct,
    direction,
    isSignificant: Math.abs(pct) >= ALERT_THRESHOLD_PCT,
  };
}