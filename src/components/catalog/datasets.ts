/**
 * Types et contracts pour le domaine Catalogue.
 *
 * Pattern aligné sur estimator/datasets.ts et dashboard/datasets.ts.
 * HardwareCategory réutilisé depuis dashboard pour cohérence.
 *
 * Note légale (sui generis L.341-1 CPI) : un `CatalogModel` est un MODÈLE
 * générique (ex. "RTX 4070 SUPER"), pas une annonce. Aucun titre brut,
 * URL, ni pseudo vendeur ne transite jamais par ces structures.
 */

import type { HardwareCategory } from "../dashboard/datasets";
export type { HardwareCategory };

export const HARDWARE_CATEGORIES: HardwareCategory[] = [
  "GPU",
  "CPU",
  "RAM",
  "SSD",
  "MOBO",
  "PSU",
];

export const CATEGORY_LABELS: Record<HardwareCategory, string> = {
  GPU: "GPU",
  CPU: "CPU",
  RAM: "RAM",
  SSD: "SSD",
  MOBO: "MOBO",
  PSU: "PSU",
};

// ============================================================================
// Manufacturer / Brand
// ============================================================================

export type Manufacturer =
  | "NVIDIA"
  | "AMD"
  | "INTEL"
  | "SAMSUNG"
  | "WD"
  | "CRUCIAL"
  | "KINGSTON"
  | "CORSAIR"
  | "GSKILL"
  | "ASUS"
  | "MSI"
  | "GIGABYTE"
  | "ASROCK"
  | "SEASONIC"
  | "BE QUIET"
  | "EVGA"
  | "NZXT";

export const MANUFACTURERS: Manufacturer[] = [
  "NVIDIA",
  "AMD",
  "INTEL",
  "SAMSUNG",
  "WD",
  "CRUCIAL",
  "KINGSTON",
  "CORSAIR",
  "GSKILL",
  "ASUS",
  "MSI",
  "GIGABYTE",
  "ASROCK",
  "SEASONIC",
  "BE QUIET",
  "EVGA",
  "NZXT",
];

export const MANUFACTURER_DOT_COLOR: Record<Manufacturer, string> = {
  NVIDIA: "#76B900",
  AMD: "#ED1C24",
  INTEL: "#0071C5",
  SAMSUNG: "#1428A0",
  WD: "#005CB9",
  CRUCIAL: "#7CB342",
  KINGSTON: "#C8102E",
  CORSAIR: "#FFD500",
  GSKILL: "#E60012",
  ASUS: "#000080",
  MSI: "#D40026",
  GIGABYTE: "#FF6600",
  ASROCK: "#0A2353",
  SEASONIC: "#F39200",
  "BE QUIET": "#FF6600",
  EVGA: "#CC0000",
  NZXT: "#7F2DFF",
};

// ============================================================================
// Sort / Filter
// ============================================================================

export type CatalogSortKey =
  | "score_desc"
  | "trend_desc"
  | "liquidity_desc"
  | "margin_desc"
  | "median_asc"
  | "median_desc"
  | "name_asc";

export const SORT_OPTIONS: Array<{ key: CatalogSortKey; label: string }> = [
  { key: "score_desc", label: "Score \u2193" },
  { key: "trend_desc", label: "Tendance \u2193" },
  { key: "liquidity_desc", label: "Liquidit\u00e9 \u2193" },
  { key: "margin_desc", label: "Marge \u2193" },
  { key: "median_asc", label: "Prix \u2191" },
  { key: "median_desc", label: "Prix \u2193" },
  { key: "name_asc", label: "A \u2192 Z" },
];

export const DEFAULT_SORT: CatalogSortKey = "score_desc";

export type CatalogFilters = {
  search: string;
  category: HardwareCategory;
  manufacturer: Manufacturer | "ALL";
  brand: string | "ALL";
  family: string | "ALL";
};

export const DEFAULT_FILTERS: CatalogFilters = {
  search: "",
  category: "GPU",
  manufacturer: "ALL",
  brand: "ALL",
  family: "ALL",
};

// ============================================================================
// CatalogModel
// ============================================================================

export type CatalogModel = {
  id: string;
  name: string;
  category: HardwareCategory;
  manufacturer: Manufacturer;
  brand: string | null;
  family: string;
  median_eur: number;
  trend_30d_pct: number;
  liquidity_pct: number;
  margin_pct: number;
  n_obs: number;
  freshness_days: number;
  score: number;
  sparkline_30d: number[];
  image_url: string | null;
};

export type CatalogListResponse = {
  models: CatalogModel[];
  total: number;
  page: number;
  total_pages: number;
  page_size: number;
};

// ============================================================================
// Helpers couleur
// ============================================================================

export function getScoreColor(score: number): string {
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export function getTrendColor(pct: number): string {
  if (pct > 0.5) return "#10B981";
  if (pct < -0.5) return "#EF4444";
  return "#71717a";
}

export function getLiquidityColor(pct: number): string {
  if (pct >= 75) return "#10B981";
  if (pct >= 50) return "#F59E0B";
  return "#EF4444";
}

export function getMarginColor(pct: number): string {
  if (pct >= 18) return "#10B981";
  if (pct >= 14) return "#F59E0B";
  return "#EF4444";
}

export const PAGE_SIZE = 24;