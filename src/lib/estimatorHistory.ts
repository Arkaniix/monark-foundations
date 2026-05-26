import { useCallback, useEffect, useState } from "react";
import type {
  EstimatorInputs,
  EstimatorResult,
} from "@/components/estimator/datasets";
import {
  fetchEstimatorHistory,
  deleteEstimatorRun,
  clearEstimatorHistory,
} from "./api/estimator";

/**
 * Historique Estimator backé par le serveur (GET/DELETE /v1/estimator/history).
 */

export const HISTORY_STORAGE_KEY = "monark.estimator.history.v1";
export const HISTORY_CAP_V1 = 50;
export const STALE_THRESHOLD_DAYS = 7;

export type EstimatorHistoryEntry = {
  id: string;
  ts: number;
  inputs: EstimatorInputs;
  result: EstimatorResult;
};

export function useEstimatorHistory() {
  const [entries, setEntries] = useState<EstimatorHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const items = await fetchEstimatorHistory(HISTORY_CAP_V1);
      setEntries(items);
    } catch {
      // on garde l'état courant en cas d'échec réseau
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (_inputs: EstimatorInputs, _result: EstimatorResult): Promise<boolean> => {
      void _inputs;
      void _result;
      await refresh();
      return true;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      try {
        await deleteEstimatorRun(id);
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    setEntries([]);
    try {
      await clearEstimatorHistory();
    } catch {
      await refresh();
    }
  }, [refresh]);

  return {
    entries,
    count: entries.length,
    cap: HISTORY_CAP_V1,
    isAtCap: entries.length >= HISTORY_CAP_V1,
    loading,
    add,
    remove,
    clear,
    refresh,
  };
}

export function isStale(entry: EstimatorHistoryEntry): boolean {
  const ageMs = Date.now() - entry.ts;
  return ageMs > STALE_THRESHOLD_DAYS * 24 * 3600 * 1000;
}

export function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}