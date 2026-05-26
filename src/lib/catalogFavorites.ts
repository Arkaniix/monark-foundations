import { useCallback, useEffect, useRef, useState } from "react";
import * as watchApi from "./api/watchlist";

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

type ServerItem = {
  dbId: number;
  modelId: string;
  snapshot_eur: number | null;
  snapshot_at: string;
};

function toServerItem(r: watchApi.ApiWatchItem): ServerItem {
  return {
    dbId: r.id,
    modelId: String(r.target_id),
    snapshot_eur: r.snapshot_eur ?? null,
    snapshot_at: r.snapshot_at ?? "",
  };
}

export function useCatalogFavorites() {
  const [items, setItems] = useState<ServerItem[]>([]);
  const [, setLoading] = useState(true);
  const itemsRef = useRef<ServerItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const refresh = useCallback(async () => {
    try {
      setItems((await watchApi.fetchWatchlist()).map(toServerItem));
    } catch {
      /* garde l'état */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const entries: FavoriteEntry[] = items.map((i) => ({
    id: i.modelId,
    snapshot_eur: i.snapshot_eur,
    snapshot_at: i.snapshot_at,
  }));
  const ids = entries.map((e) => e.id);

  const has = useCallback(
    (id: string) => itemsRef.current.some((i) => i.modelId === id),
    [],
  );

  const getSnapshot = useCallback((id: string): FavoriteEntry | null => {
    const it = itemsRef.current.find((i) => i.modelId === id);
    return it
      ? { id: it.modelId, snapshot_eur: it.snapshot_eur, snapshot_at: it.snapshot_at }
      : null;
  }, []);

  const toggle = useCallback(
    async (id: string, currentMedian?: number) => {
      const existing = itemsRef.current.find((i) => i.modelId === id);
      if (existing) {
        setItems((prev) => prev.filter((i) => i.modelId !== id));
        try {
          await watchApi.removeWatch(existing.dbId);
        } catch {
          await refresh();
        }
      } else {
        const snap = typeof currentMedian === "number" ? currentMedian : null;
        try {
          const r = await watchApi.addWatch(Number(id), snap);
          setItems((prev) =>
            prev.some((i) => i.modelId === id) ? prev : [...prev, toServerItem(r)],
          );
        } catch {
          await refresh();
        }
      }
    },
    [refresh],
  );

  const backfillSnapshot = useCallback(
    async (id: string, currentMedian: number) => {
      const it = itemsRef.current.find((i) => i.modelId === id);
      if (!it || it.snapshot_eur !== null) return;
      try {
        const r = await watchApi.addWatch(Number(id), currentMedian);
        setItems((prev) =>
          prev.map((i) =>
            i.modelId === id
              ? {
                  ...i,
                  snapshot_eur: r.snapshot_eur ?? currentMedian,
                  snapshot_at: r.snapshot_at ?? i.snapshot_at,
                }
              : i,
          ),
        );
      } catch {
        /* noop */
      }
    },
    [],
  );

  return { ids, entries, toggle, has, getSnapshot, backfillSnapshot };
}

export function computeMovementDelta(
  snapshot: FavoriteEntry | null,
  currentMedian: number,
): MovementDelta | null {
  if (!snapshot || snapshot.snapshot_eur === null || snapshot.snapshot_eur === 0) {
    return null;
  }
  const pct =
    ((currentMedian - snapshot.snapshot_eur) / snapshot.snapshot_eur) * 100;
  const direction: MovementDelta["direction"] =
    pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat";
  return {
    pct,
    direction,
    isSignificant: Math.abs(pct) >= MOVEMENT_THRESHOLD_PCT,
  };
}