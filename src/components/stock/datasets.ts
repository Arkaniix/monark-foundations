/**
 * Types et helpers Inventaire (Stock Manager).
 */

import type { HardwareCategory } from "../catalog/datasets";

export type StockSource = "catalog" | "custom";
export type StockStatus = "in_stock" | "listed" | "sold" | "returned";
export type PlatformKey = "LBC" | "VINTED" | "EBAY" | "LOCAL" | "AUTRE";
export type ConditionKey = "NEUF" | "TBE" | "BON" | "ACCEPTABLE" | "POUR_PIECES";

export type StockItem = {
  id: string;
  source: StockSource;
  model_id: string | null;
  custom_name: string | null;
  custom_category: HardwareCategory | "OTHER" | null;
  model_name_snapshot: string;
  category_snapshot: HardwareCategory | "OTHER";
  purchase_price_eur: number;
  purchase_date: string;
  purchase_platform: PlatformKey;
  condition: ConditionKey;
  notes: string | null;
  status: StockStatus;
  sale_price_eur: number | null;
  sale_date: string | null;
  sale_platform: PlatformKey | null;
  fees_eur: number | null;
  build_id: string | null;
  created_at: string;
};

export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  LBC: "LBC",
  VINTED: "Vinted",
  EBAY: "eBay",
  LOCAL: "Local",
  AUTRE: "Autre",
};

export const PLATFORM_DOT_COLOR: Record<PlatformKey, string> = {
  LBC: "#FF6E14",
  VINTED: "#09B1BA",
  EBAY: "#0064D2",
  LOCAL: "#71717A",
  AUTRE: "#52525B",
};

export const PLATFORMS: PlatformKey[] = ["LBC", "VINTED", "EBAY", "LOCAL", "AUTRE"];

export const CONDITION_LABELS: Record<ConditionKey, string> = {
  NEUF: "Neuf",
  TBE: "Très bon",
  BON: "Bon",
  ACCEPTABLE: "Acceptable",
  POUR_PIECES: "Pour pièces",
};

export const CONDITIONS: ConditionKey[] = [
  "NEUF",
  "TBE",
  "BON",
  "ACCEPTABLE",
  "POUR_PIECES",
];

export const STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "En stock",
  listed: "Listé",
  sold: "Vendu",
  returned: "Retourné",
};

export const STATUS_BADGE_STYLE: Record<StockStatus, { bg: string; fg: string }> = {
  in_stock: { bg: "rgba(59,130,246,0.12)", fg: "#60A5FA" },
  listed: { bg: "rgba(245,158,11,0.12)", fg: "#F59E0B" },
  sold: { bg: "rgba(16,185,129,0.12)", fg: "#10B981" },
  returned: { bg: "rgba(113,113,122,0.18)", fg: "#A1A1AA" },
};

export type StockDensity = "compact" | "aere";

export const STOCK_DENSITIES: Array<{ key: StockDensity; label: string }> = [
  { key: "compact", label: "COMPACT" },
  { key: "aere", label: "AÉRÉ" },
];

export const DEFAULT_STOCK_DENSITY: StockDensity = "compact";

const DENSITY_STORAGE_KEY = "monark.stock.density.v1";

export function loadStockDensity(): StockDensity {
  if (typeof window === "undefined") return DEFAULT_STOCK_DENSITY;
  try {
    const raw = window.localStorage.getItem(DENSITY_STORAGE_KEY);
    if (raw === "compact" || raw === "aere") return raw;
    return DEFAULT_STOCK_DENSITY;
  } catch {
    return DEFAULT_STOCK_DENSITY;
  }
}

export function saveStockDensity(d: StockDensity) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, d);
  } catch {
    /* noop */
  }
}

export type StockTab = "actifs" | "historique" | "comptes" | "builds";

export const STOCK_TABS: Array<{
  key: StockTab;
  label: string;
  available: boolean;
}> = [
  { key: "actifs", label: "ACTIFS", available: true },
  { key: "historique", label: "HISTORIQUE", available: false },
  { key: "comptes", label: "COMPTES", available: false },
  { key: "builds", label: "BUILDS", available: false },
];

export type StockCategoryFilter = HardwareCategory | "ALL";

export type StockSortKey =
  | "recent_desc"
  | "aging_desc"
  | "price_desc"
  | "price_asc"
  | "name_asc";

export const STOCK_SORT_OPTIONS: Array<{ key: StockSortKey; label: string }> = [
  { key: "recent_desc", label: "Récent ↓" },
  { key: "aging_desc", label: "Aging ↓" },
  { key: "price_desc", label: "Prix ↓" },
  { key: "price_asc", label: "Prix ↑" },
  { key: "name_asc", label: "A → Z" },
];

export type StockFilters = {
  category: StockCategoryFilter;
  search: string;
  sort: StockSortKey;
};

export const DEFAULT_STOCK_FILTERS: StockFilters = {
  category: "ALL",
  search: "",
  sort: "recent_desc",
};

export function daysHeld(item: StockItem, now: Date = new Date()): number {
  const purchase = new Date(item.purchase_date).getTime();
  if (Number.isNaN(purchase)) return 0;
  const diffMs = now.getTime() - purchase;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function isActif(item: StockItem): boolean {
  return item.status === "in_stock" || item.status === "listed";
}

export function isDormant(item: StockItem, thresholdDays = 60): boolean {
  return isActif(item) && daysHeld(item) >= thresholdDays;
}

export function agingColor(days: number): string {
  if (days >= 90) return "#EF4444";
  if (days >= 60) return "#F59E0B";
  return "#71717A";
}

export function agingRowAccent(days: number): string | null {
  if (days >= 90) return "rgba(239,68,68,0.04)";
  if (days >= 60) return "rgba(245,158,11,0.04)";
  return null;
}

export function formatDateShortFR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function newStockItemId(): string {
  return `stk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function applyActifsFilters(
  items: StockItem[],
  filters: StockFilters,
): StockItem[] {
  let result = items.filter(isActif);

  if (filters.category !== "ALL") {
    result = result.filter((it) => it.category_snapshot === filters.category);
  }

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((it) =>
      it.model_name_snapshot.toLowerCase().includes(q),
    );
  }

  const sorted = [...result];
  switch (filters.sort) {
    case "recent_desc":
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    case "aging_desc":
      sorted.sort((a, b) => daysHeld(b) - daysHeld(a));
      break;
    case "price_desc":
      sorted.sort((a, b) => b.purchase_price_eur - a.purchase_price_eur);
      break;
    case "price_asc":
      sorted.sort((a, b) => a.purchase_price_eur - b.purchase_price_eur);
      break;
    case "name_asc":
      sorted.sort((a, b) =>
        a.model_name_snapshot.localeCompare(b.model_name_snapshot),
      );
      break;
  }
  return sorted;
}