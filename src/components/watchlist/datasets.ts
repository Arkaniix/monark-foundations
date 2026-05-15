/**
 * Types et helpers Watchlist V1.
 *
 * Note légale (sui generis L.341-1 CPI) : la Watchlist consomme uniquement
 * des `CatalogModel` (données agrégées Monark). Aucune annonce tierce.
 */

import type { CatalogModel, HardwareCategory } from "../catalog/datasets";

/* -------------------------------------------------------------------------- */
/* Densité d'affichage                                                         */
/* -------------------------------------------------------------------------- */

export type WatchlistDensity = "compact" | "aere" | "cards";

export const WATCHLIST_DENSITIES: Array<{
  key: WatchlistDensity;
  label: string;
}> = [
  { key: "compact", label: "COMPACT" },
  { key: "aere", label: "AÉRÉ" },
  { key: "cards", label: "CARDS" },
];

export const DEFAULT_WATCHLIST_DENSITY: WatchlistDensity = "compact";

const DENSITY_STORAGE_KEY = "monark.watchlist.density.v1";

export function loadDensity(): WatchlistDensity {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST_DENSITY;
  try {
    const raw = window.localStorage.getItem(DENSITY_STORAGE_KEY);
    if (raw === "compact" || raw === "aere" || raw === "cards") return raw;
    return DEFAULT_WATCHLIST_DENSITY;
  } catch {
    return DEFAULT_WATCHLIST_DENSITY;
  }
}

export function saveDensity(density: WatchlistDensity) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
  } catch {
    /* noop */
  }
}

/* -------------------------------------------------------------------------- */
/* Tri tri-state                                                               */
/* -------------------------------------------------------------------------- */

export type SortableColumn =
  | "name"
  | "score"
  | "median"
  | "snapshot"
  | "delta"
  | "trend"
  | "liquidity"
  | "margin";

export type SortDirection = "asc" | "desc";

export type SortState = { column: SortableColumn; direction: SortDirection } | null;

export const DEFAULT_SORT_STATE: SortState = { column: "score", direction: "desc" };

export function cycleSort(current: SortState, column: SortableColumn): SortState {
  if (!current || current.column !== column) {
    return { column, direction: "desc" };
  }
  if (current.direction === "desc") {
    return { column, direction: "asc" };
  }
  return null;
}

export type WatchlistFilterCategory = HardwareCategory | "ALL";

export const WATCHLIST_SORT_OPTIONS: Array<{
  key: string;
  label: string;
  state: SortState;
}> = [
  { key: "score_desc", label: "Score \u2193", state: { column: "score", direction: "desc" } },
  { key: "trend_desc", label: "Tendance \u2193", state: { column: "trend", direction: "desc" } },
  { key: "liquidity_desc", label: "Liquidit\u00e9 \u2193", state: { column: "liquidity", direction: "desc" } },
  { key: "margin_desc", label: "Marge \u2193", state: { column: "margin", direction: "desc" } },
  { key: "median_desc", label: "Prix \u2193", state: { column: "median", direction: "desc" } },
  { key: "median_asc", label: "Prix \u2191", state: { column: "median", direction: "asc" } },
  { key: "delta_desc", label: "\u0394 depuis pin \u2193", state: { column: "delta", direction: "desc" } },
  { key: "name_asc", label: "A \u2192 Z", state: { column: "name", direction: "asc" } },
  { key: "default", label: "Par d\u00e9faut", state: null },
];

export function sortStateToOptionKey(state: SortState): string {
  if (!state) return "default";
  const match = WATCHLIST_SORT_OPTIONS.find(
    (opt) =>
      opt.state !== null &&
      opt.state.column === state.column &&
      opt.state.direction === state.direction,
  );
  return match?.key ?? "default";
}

export type WatchlistFilters = {
  category: WatchlistFilterCategory;
  search: string;
};

export const DEFAULT_WATCHLIST_FILTERS: WatchlistFilters = {
  category: "ALL",
  search: "",
};

export function applyWatchlistFilters(
  models: CatalogModel[],
  filters: WatchlistFilters,
  sortState: SortState,
  snapshotsByModelId?: Record<string, { snapshot_eur: number | null }>,
): CatalogModel[] {
  let result = models;

  if (filters.category !== "ALL") {
    result = result.filter((m) => m.category === filters.category);
  }

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        m.family.toLowerCase().includes(q),
    );
  }

  if (!sortState) return result;

  const dir = sortState.direction === "asc" ? 1 : -1;
  const snaps = snapshotsByModelId ?? {};

  return [...result].sort((a, b) => {
    switch (sortState.column) {
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "score":
        return (a.score - b.score) * dir;
      case "median":
        return (a.median_eur - b.median_eur) * dir;
      case "trend":
        return (a.trend_30d_pct - b.trend_30d_pct) * dir;
      case "liquidity":
        return (a.liquidity_pct - b.liquidity_pct) * dir;
      case "margin":
        return (a.margin_pct - b.margin_pct) * dir;
      case "snapshot": {
        const va = snaps[a.id]?.snapshot_eur ?? 0;
        const vb = snaps[b.id]?.snapshot_eur ?? 0;
        return (va - vb) * dir;
      }
      case "delta": {
        const sa = snaps[a.id]?.snapshot_eur;
        const sb = snaps[b.id]?.snapshot_eur;
        const da = sa && sa !== 0 ? ((a.median_eur - sa) / sa) * 100 : 0;
        const db = sb && sb !== 0 ? ((b.median_eur - sb) / sb) * 100 : 0;
        return (da - db) * dir;
      }
      default:
        return 0;
    }
  });
}

export function formatRelativeShort(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return "à l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;
  const diffMo = Math.floor(diffD / 30);
  return `il y a ${diffMo} mois`;
}