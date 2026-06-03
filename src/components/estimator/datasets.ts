/**
 * Types et contracts pour le domaine Estimator.
 * E1 base, E2 §02, E3 §01+§03, E3.1 getScoreColor, E4 §04 Négociation.
 */

import type { Verdict, HardwareCategory } from "../dashboard/datasets";
import { VERDICT_COLORS } from "../dashboard/datasets";

export type { Verdict, HardwareCategory };
export { VERDICT_COLORS };

export type Platform = "LBC" | "Vinted" | "eBay";

export const PLATFORMS: Platform[] = ["LBC", "Vinted", "eBay"];

export const PLATFORM_FEES_PCT: Record<Platform, number> = {
  LBC: 12,
  Vinted: 5,
  eBay: 18,
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
  listing_age_days?: number;
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

export type ScoreBreakdown = {
  base: number;
  trend: number;
  liquidity: number;
  value_vs_new: number;
  total_adjusted: number;
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

// E4 — Négociation §04

export type OfferTier = "lowball" | "negotiated" | "cordial";

export type Likelihood = "élevée" | "modérée" | "faible";

export type NegotiationOffer = {
  type: string;
  label: string;
  price_eur: number;
  estimated_net_margin_eur: number;
  likelihood: Likelihood;
  // Legacy (anciens champs : tolérés mais non utilisés en F1)
  tier?: OfferTier;
  amount_eur?: number;
  pct_of_ask?: number;
  savings_eur?: number;
  acceptance_probability_pct?: number;
};

export type ArgumentWeight = "fort" | "modéré" | "faible";

export type NegotiationArgument = {
  category: "marché" | "état" | "concurrence" | "position";
  label: string;
  weight: ArgumentWeight;
};

export type NegotiationKeywords = {
  opportunity: string[];
  red_flag: string[];
};

export type NegotiationPlan = {
  offers: NegotiationOffer[];
  arguments: NegotiationArgument[];
  keywords: NegotiationKeywords;
  strategy_narrative: string;
  seller_motivation?: {
    level: string;
    age_days: number;
    narrative: string;
  };
};

// E5a — Où revendre §05a

export type PlatformResaleStats = {
  platform: Platform;
  estimated_price_eur: number;
  fees_pct: number;
  net_margin_eur: number;
  expected_delay_days: number;
  recommendation_score: number;
  is_top_pick: boolean;
  narrative: string;
  data_confidence?: "low" | "medium" | "high";
  seller_net_price?: number;
};

export type ResaleWhereRecommendation = {
  cost_basis_eur: number;
  platforms: PlatformResaleStats[];
  top_pick_narrative: string;
};

// E5b — Quand revendre §05b

export type ResaleTiming = "RAPIDE" | "OPTIMAL" | "PATIENT";

export const RESALE_TIMINGS: ResaleTiming[] = ["RAPIDE", "OPTIMAL", "PATIENT"];

export type ResaleWhenOption = {
  timing: ResaleTiming;
  expected_price_eur: number;
  expected_delay_days: number;
  likelihood: Likelihood;
  net_margin_eur: number;
  is_top_pick: boolean;
  narrative: string;
  acceptance_probability_pct?: number;
};

export type ResaleWhenRecommendation = {
  by_platform: Record<Platform, ResaleWhenOption[]>;
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

  price_history_30d: number[];
  percentile_position_pct: number;
  category_market_stats: CategoryMarketStats;

  score_total: number;
  score_breakdown: ScoreBreakdown;
  landmarks: BuyResaleLandmarks;
  data_quality: DataQuality;

  negotiation: NegotiationPlan;

  has_market_detail?: boolean;

  resale_where?: ResaleWhereRecommendation;
  resale_when?: ResaleWhenRecommendation;

  warnings?: {
    code: string;
    severity: "danger" | "warning";
    message: string;
  }[];
  positioning_basis?: string;
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

export const NEGOTIATION_KEYWORDS = {
  opportunity: [
    "urgent",
    "déménagement",
    "à débarrasser",
    "raisonnable",
    "à discuter",
    "petit prix",
    "vite",
    "négociable",
  ],
  red_flag: [
    "en l'état",
    "pour pièces",
    "no return",
    "non testé",
    "ne fonctionne plus",
    "sans garantie",
  ],
};

export function getScoreColor(value: number): string {
  if (value >= 75) return "#10B981";
  if (value >= 50) return "#F59E0B";
  return "#EF4444";
}
