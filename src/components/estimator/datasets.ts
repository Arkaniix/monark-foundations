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
  Vinted: 0,
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
  flow?: "buy" | "sell";
  acquisition_cost?: number;
};

export type PercentileDistribution = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

export type SoldHistogramBin = {
  bin_min: number;
  bin_max: number;
  count: number;
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

export type TrendStatus = "En hausse" | "Stable" | "En baisse" | "Indéterminée";

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

export type ValueVsNewStatus = "Forte" | "Modérée" | "Faible" | "Indisponible";

export type MarketValueVsNewStats = {
  decote_pct: number | null;
  status: ValueVsNewStatus;
  shortage_signal?: boolean;
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

export type StrategyMode = "secure_deal" | "negotiate" | "lowball" | "walk";

export type NegotiationPlan = {
  offers: NegotiationOffer[];
  arguments: NegotiationArgument[];
  keywords: NegotiationKeywords;
  /** Réflexes contextuels calculés par le back (Phase 2). Fallback : keywords statiques. */
  reflexes?: NegotiationKeywords;
  /** Posture recommandée pour ce cas (Phase 2). */
  strategy_mode?: StrategyMode;
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
  expected_delay_days: number | null;
  est_sell_days_basis?: string;
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
  raw?: unknown;
  inputs: EstimatorInputs;
  flow?: "buy" | "sell";
  model_name: string;
  category: HardwareCategory;
  verdict: Verdict;
  confidence_pct: number;
  fair_price_eur: number;
  net_margin_eur: number;
  percentile_distribution: PercentileDistribution;
  /** Histogramme réel des ventes sold (24 bins). Présent en flow=buy ; null sinon. */
  sold_histogram?: SoldHistogramBin[] | null;
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
    /** Champs enrichis Phase 2 (présents sur price_anomaly_low). */
    headline?: string;
    delta_vs_market_pct?: number;
    scam_signals?: string[];
    verification_steps?: string[];
    recommended_action?: "buy_now" | "verify_then_buy" | "avoid";
    action_rationale?: string;
  }[];
  positioning_basis?: string;
};

// F2a — Mode VENTE

export type SellStrategyTier = "rapide" | "optimal" | "patient";

export type SellStrategy = {
  tier: SellStrategyTier;
  listing_price: number;
  net_price: number;
  est_days: number;
  likelihood: Likelihood;
  profit_eur?: number;
  profit_pct?: number;
};

export type SellPlatform = {
  platform: Platform;
  seller_net_price: number;
  fees_pct: number;
  net_margin_eur?: number;
  est_sell_days: number | null;
  est_sell_days_basis?: string;
  is_recommended: boolean;
  data_confidence?: "low" | "medium" | "high";
  narrative: string;
};

export type SellResult = {
  raw?: unknown;
  flow: "sell";
  inputs: EstimatorInputs;
  model_name: string;
  category: HardwareCategory;
  median_eur: number;
  trend_status: TrendStatus;
  trend_narrative: string;
  acquisition_cost?: number;
  recommended: SellStrategy;
  strategies: SellStrategy[];
  platforms: SellPlatform[];
  best_platform: Platform;
  evaluated_at: string;
  decay?: DecayStep[];
  projection?: SellProjection;
  presentation?: SellPresentation;
  pricing_basis?: PricingBasis;
};

// F2b — Vente : décote / projection / présentation / basis

export type DecayStep = {
  day: number;
  strategy: "patient" | "optimal" | "rapide";
  price: number;
};

export type SellProjection = {
  timing: "good" | "neutral" | "cautious" | "bad";
  trend_30d_pct: number | null;
  projected_patient_value: number | null;
  narrative: string;
};

export type SellPresentation = {
  completeness: string[];
  terms_to_avoid: string[];
  terms_to_favor: string[];
  condition_framing: string;
  category_tip?: string;
};

export type PricingBasis = {
  data_source_tier: 1 | 2 | 3;
  data_confidence: "high" | "medium" | "low";
};

export type AnyEstimatorResult = EstimatorResult | SellResult;

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
