/**
 * Types et contracts pour le domaine Estimator.
 *
 * Tech debt : `Verdict` + `VERDICT_COLORS` sont importés depuis
 * `dashboard/datasets` pour l'instant — à terme, rapatrier dans un module
 * shared neutre une fois plusieurs domaines les consommeront.
 */

import type { Verdict, HardwareCategory } from "../dashboard/datasets";
import { VERDICT_COLORS } from "../dashboard/datasets";

export type { Verdict, HardwareCategory };
export { VERDICT_COLORS };

export type Platform = "LBC" | "Vinted" | "eBay" | "Particulier";

export const PLATFORMS: Platform[] = ["LBC", "Vinted", "eBay", "Particulier"];

export const PLATFORM_FEES_PCT: Record<Platform, number> = {
  LBC: 12,
  Vinted: 5,
  eBay: 18,
  Particulier: 0,
};

export type ItemState =
  | "Neuf"
  | "Comme neuf"
  | "Bon"
  | "Acceptable"
  | "Pour pièces";

export const ITEM_STATES: ItemState[] = [
  "Neuf",
  "Comme neuf",
  "Bon",
  "Acceptable",
  "Pour pièces",
];

export const VERDICT_DISPLAY_LABELS: Record<Verdict, string> = {
  FONCER: "FONCER",
  "NÉGOCIER": "NÉGOCIER",
  TENTER: "TENTER AU CULOT",
  PASSER: "PASSER",
};

export const VERDICT_GLOW_CLASS: Record<Verdict, string> = {
  FONCER: "glow-green",
  "NÉGOCIER": "glow-amber",
  TENTER: "glow-violet",
  PASSER: "glow-red",
};

export type EstimatorInputs = {
  model: string;
  state: ItemState;
  ask_price_eur: number;
  platform: Platform;
  shipping_cost_eur?: number;
  region_fr?: string;
};

export type PercentileDistribution = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

export type CompositeScore = {
  margin: number;
  liquidity: number;
  affinity: number;
};

export type VerdictModifiers = {
  trend_14d: number;
  liquidity_mod: number;
  value_vs_new: number;
};

export type EstimatorResult = {
  inputs: EstimatorInputs;
  model_name: string;
  category: HardwareCategory;
  verdict: Verdict;
  confidence_pct: number;
  fair_price_eur: number;
  net_margin_eur: number;
  percentile_distribution: PercentileDistribution;
  composite_score: CompositeScore;
  modifiers: VerdictModifiers;
  platform_fees_pct: number;
  evaluated_at: string;
};

export type HardwareModel = {
  name: string;
  category: HardwareCategory;
  base_price_eur: number;
};

export const HARDWARE_CATALOG: HardwareModel[] = [
  { name: "RTX 4070 SUPER", category: "GPU", base_price_eur: 540 },
  { name: "RTX 4070 Ti SUPER", category: "GPU", base_price_eur: 720 },
  { name: "RTX 4080 SUPER", category: "GPU", base_price_eur: 920 },
  { name: "RTX 4090", category: "GPU", base_price_eur: 1620 },
  { name: "RTX 3090", category: "GPU", base_price_eur: 620 },
  { name: "RX 7800 XT", category: "GPU", base_price_eur: 420 },
  { name: "RX 7900 XTX", category: "GPU", base_price_eur: 780 },
  { name: "Ryzen 7 7800X3D", category: "CPU", base_price_eur: 340 },
  { name: "Ryzen 5 7600", category: "CPU", base_price_eur: 190 },
  { name: "Ryzen 9 7950X3D", category: "CPU", base_price_eur: 540 },
  { name: "i7-13700K", category: "CPU", base_price_eur: 270 },
  { name: "i9-13900K", category: "CPU", base_price_eur: 420 },
  { name: "DDR5-6000 32GB", category: "RAM", base_price_eur: 98 },
  { name: "DDR5-6400 64GB", category: "RAM", base_price_eur: 195 },
  { name: "990 PRO 2TB", category: "SSD", base_price_eur: 165 },
  { name: "990 PRO 4TB", category: "SSD", base_price_eur: 320 },
  { name: "B650 TOMAHAWK", category: "MOBO", base_price_eur: 145 },
  { name: "X670E HERO", category: "MOBO", base_price_eur: 380 },
  { name: "RM850x", category: "PSU", base_price_eur: 110 },
  { name: "HX1200", category: "PSU", base_price_eur: 200 },
];