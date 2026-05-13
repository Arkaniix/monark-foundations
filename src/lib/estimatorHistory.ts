import { useCallback, useEffect, useState } from "react";
import type {
  EstimatorInputs,
  EstimatorResult,
} from "@/components/estimator/datasets";

/**
 * Store localStorage typé pour l'historique des évaluations Estimator.
 * V1 : client-only, snapshot complet, cap fixe 50.
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

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function generateId(): string {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadRaw(): EstimatorHistoryEntry[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is EstimatorHistoryEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as EstimatorHistoryEntry).id === "string" &&
        typeof (e as EstimatorHistoryEntry).ts === "number" &&
        typeof (e as EstimatorHistoryEntry).inputs === "object" &&
        typeof (e as EstimatorHistoryEntry).result === "object",
    );
  } catch {
    return [];
  }
}

function saveRaw(entries: EstimatorHistoryEntry[]): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // silent fail
  }
}

export function useEstimatorHistory() {
  const [entries, setEntries] = useState<EstimatorHistoryEntry[]>(() => loadRaw());

  useEffect(() => {
    if (!isClient()) return;
    const handler = (e: StorageEvent) => {
      if (e.key === HISTORY_STORAGE_KEY) {
        setEntries(loadRaw());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const add = useCallback(
    (inputs: EstimatorInputs, result: EstimatorResult): boolean => {
      if (entries.length >= HISTORY_CAP_V1) return false;
      const newEntry: EstimatorHistoryEntry = {
        id: generateId(),
        ts: Date.now(),
        inputs,
        result,
      };
      const next = [newEntry, ...entries];
      setEntries(next);
      saveRaw(next);
      return true;
    },
    [entries],
  );

  const remove = useCallback(
    (id: string) => {
      const next = entries.filter((e) => e.id !== id);
      setEntries(next);
      saveRaw(next);
    },
    [entries],
  );

  const clear = useCallback(() => {
    setEntries([]);
    saveRaw([]);
  }, []);

  const isAtCap = entries.length >= HISTORY_CAP_V1;

  return {
    entries,
    count: entries.length,
    cap: HISTORY_CAP_V1,
    isAtCap,
    add,
    remove,
    clear,
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