/**
 * Types et contracts pour le domaine Estimator.
 *
 * E2 : ajout price_history_30d, percentile_position_pct, observations_count, category_market_stats.
 * E3 : ajout score_total, score_breakdown, landmarks, data_quality.
 *      Migration : observations_count flat → data_quality.observations_count.
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

// === E2 — Market stats §02 ===

export type TrendStatus = "En hausse" | "Stable" | "En baisse";

export type MarketTrendStats = {
  delta_7d_pct: number;
  delta_30d_pct: number;
  status: TrendStatus;
  narrative: string;
};

export type LiquidityStatus = "Élevée" | "Modérée" | "Faible";

export type MarketLiquidityStats = {
  sales_30d: number;
  active_listings: number;
  status: LiquidityStatus;
  narrative: string;
};

export type ValueVsNewStatus = "Forte" | "Modérée" | "Faible";

export type MarketValueVsNewStats = {
  decote_pct: number;
  status: ValueVsNewStatus;
  narrative: string;
};

export type CategoryMarketStats = {
  trend: MarketTrendStats;
  liquidity: MarketLiquidityStats;
  value_vs_new: MarketValueVsNewStats;
};

// === E3 — Score breakdown §03 + landmarks §01 ===

export type ScoreBreakdown = {
  base: number;
  trend: number;
  liquidity: number;
  value_vs_new: number;
  total: number;
};

export type BuyResaleLandmarks = {
  ceiling_buy_eur: number;
  optimal_buy_eur: number;
  floor_resale_eur: number;
};

export type DataQuality = {
  observations_count: number;
  fresh_within_hours: number;
  platform_specific: boolean;
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

  // E2 §02
  price_history_30d: number[];
  percentile_position_pct: number;
  category_market_stats: CategoryMarketStats;

  // E3 §01 enrichi + §03
  score_total: number;
  score_breakdown: ScoreBreakdown;
  landmarks: BuyResaleLandmarks;
  data_quality: DataQuality;
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
