/**
 * Types et helpers Watchlist V1.
 *
 * Note légale (sui generis L.341-1 CPI) : la Watchlist consomme uniquement
 * des `CatalogModel` (données agrégées Monark). Aucune annonce tierce.
 */

import type { CatalogModel, HardwareCategory } from "../catalog/datasets";

export type WatchlistFilterCategory = HardwareCategory | "ALL";

export type WatchlistSortKey =
  | "score_desc"
  | "trend_desc"
  | "liquidity_desc"
  | "median_desc"
  | "median_asc"
  | "name_asc";

export const WATCHLIST_SORT_OPTIONS: Array<{
  key: WatchlistSortKey;
  label: string;
}> = [
  { key: "score_desc", label: "Score \u2193" },
  { key: "trend_desc", label: "Tendance \u2193" },
  { key: "liquidity_desc", label: "Liquidit\u00e9 \u2193" },
  { key: "median_desc", label: "Prix \u2193" },
  { key: "median_asc", label: "Prix \u2191" },
  { key: "name_asc", label: "A \u2192 Z" },
];

export type WatchlistFilters = {
  category: WatchlistFilterCategory;
  search: string;
};

export const DEFAULT_WATCHLIST_FILTERS: WatchlistFilters = {
  category: "ALL",
  search: "",
};

export const DEFAULT_WATCHLIST_SORT: WatchlistSortKey = "score_desc";

export function applyWatchlistFilters(
  models: CatalogModel[],
  filters: WatchlistFilters,
  sort: WatchlistSortKey,
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

  return [...result].sort((a, b) => {
    switch (sort) {
      case "score_desc":
        return b.score - a.score;
      case "trend_desc":
        return b.trend_30d_pct - a.trend_30d_pct;
      case "liquidity_desc":
        return b.liquidity_pct - a.liquidity_pct;
      case "median_desc":
        return b.median_eur - a.median_eur;
      case "median_asc":
        return a.median_eur - b.median_eur;
      case "name_asc":
        return a.name.localeCompare(b.name);
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