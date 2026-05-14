import { useCallback, useEffect, useState } from "react";

const KEY_V1 = "monark.catalog.favorites.v1";
const KEY_V2 = "monark.catalog.favorites.v2";
const KEY_ALERTS_LEGACY_V1 = "monark.catalog.alerts.v1";
const KEY_ALERTS_LEGACY_V2 = "monark.catalog.alerts.v2";

/** Seuil de détection visuelle d'un mouvement significatif depuis épinglage (±%). */
export const MOVEMENT_THRESHOLD_PCT = 5;

export type FavoriteEntry = {
  id: string;
  snapshot_eur: number | null;
  snapshot_at: string;
};

export type MovementDelta = {
  pct: number;
  direction: "up" | "down" | "flat";
  isSignificant: boolean;
};

type LegacyAlertEntryV2 = {
  id: string;
  snapshot_eur: number | null;
  snapshot_at: string;
};

function load(): FavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const rawV2 = window.localStorage.getItem(KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (x): x is FavoriteEntry =>
            x != null &&
            typeof x === "object" &&
            typeof x.id === "string" &&
            (typeof x.snapshot_eur === "number" || x.snapshot_eur === null) &&
            typeof x.snapshot_at === "string",
        );
      }
    }

    const nowIso = new Date().toISOString();

    const fromFavoritesV1: FavoriteEntry[] = (() => {
      const rawV1 = window.localStorage.getItem(KEY_V1);
      if (!rawV1) return [];
      try {
        const parsedV1 = JSON.parse(rawV1);
        if (!Array.isArray(parsedV1)) return [];
        return parsedV1
          .filter((x): x is string => typeof x === "string")
          .map((id) => ({ id, snapshot_eur: null, snapshot_at: nowIso }));
      } catch {
        return [];
      }
    })();

    const fromAlertsV2: FavoriteEntry[] = (() => {
      const rawAlertsV2 = window.localStorage.getItem(KEY_ALERTS_LEGACY_V2);
      if (!rawAlertsV2) return [];
      try {
        const parsed = JSON.parse(rawAlertsV2);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .filter(
            (x): x is LegacyAlertEntryV2 =>
              x != null &&
              typeof x === "object" &&
              typeof x.id === "string" &&
              (typeof x.snapshot_eur === "number" || x.snapshot_eur === null) &&
              typeof x.snapshot_at === "string",
          )
          .map((e) => ({
            id: e.id,
            snapshot_eur: e.snapshot_eur,
            snapshot_at: e.snapshot_at,
          }));
      } catch {
        return [];
      }
    })();

    const merged = new Map<string, FavoriteEntry>();
    for (const entry of fromFavoritesV1) merged.set(entry.id, entry);
    for (const entry of fromAlertsV2) {
      const existing = merged.get(entry.id);
      if (!existing || (existing.snapshot_eur === null && entry.snapshot_eur !== null)) {
        merged.set(entry.id, entry);
      }
    }

    const migrated = Array.from(merged.values());
    if (migrated.length > 0) {
      window.localStorage.setItem(KEY_V2, JSON.stringify(migrated));
    }

    try {
      window.localStorage.removeItem(KEY_V1);
      window.localStorage.removeItem(KEY_ALERTS_LEGACY_V1);
      window.localStorage.removeItem(KEY_ALERTS_LEGACY_V2);
    } catch {
      /* noop */
    }

    return migrated;
  } catch {
    return [];
  }
}

function save(entries: FavoriteEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_V2, JSON.stringify(entries));
  } catch {
    /* noop */
  }
}

export function useCatalogFavorites() {
  const [entries, setEntries] = useState<FavoriteEntry[]>(() => load());

  useEffect(() => {
    save(entries);
  }, [entries]);

  const ids = entries.map((e) => e.id);

  const toggle = useCallback((id: string, currentMedian?: number) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.id === id);
      if (existing) return prev.filter((e) => e.id !== id);
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
    (id: string): FavoriteEntry | null => entries.find((e) => e.id === id) ?? null,
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

export function computeMovementDelta(
  snapshot: FavoriteEntry | null,
  currentMedian: number,
): MovementDelta | null {
  if (!snapshot || snapshot.snapshot_eur === null || snapshot.snapshot_eur === 0) {
    return null;
  }
  const pct = ((currentMedian - snapshot.snapshot_eur) / snapshot.snapshot_eur) * 100;
  const direction: MovementDelta["direction"] =
    pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat";
  return {
    pct,
    direction,
    isSignificant: Math.abs(pct) >= MOVEMENT_THRESHOLD_PCT,
  };
}