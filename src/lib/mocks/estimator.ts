/**
 * Mock Estimator API — étendu E2 (§02 Positionnement marché).
 */

import { mockDelay } from "./fixtures";
import {
  HARDWARE_CATALOG,
  PLATFORM_FEES_PCT,
  type CategoryMarketStats,
  type EstimatorInputs,
  type EstimatorResult,
  type HardwareCategory,
  type ItemState,
  type LiquidityStatus,
  type PercentileDistribution,
  type Platform,
  type TrendStatus,
  type ValueVsNewStatus,
  type Verdict,
} from "../../components/estimator/datasets";

const STATE_MULTIPLIERS: Record<ItemState, number> = {
  Neuf: 1.05,
  "Comme neuf": 1.0,
  Bon: 0.92,
  Acceptable: 0.8,
  "Pour pièces": 0.45,
};

const PLATFORM_LIQUIDITY: Record<Platform, number> = {
  LBC: 0.78,
  Vinted: 0.61,
  eBay: 0.74,
  Particulier: 0.55,
};

const PLATFORM_AFFINITY: Record<Platform, number> = {
  LBC: 88,
  eBay: 82,
  Vinted: 64,
  Particulier: 58,
};

const STATE_DECOTE_PCT: Record<ItemState, number> = {
  Neuf: -5,
  "Comme neuf": -13,
  Bon: -22,
  Acceptable: -32,
  "Pour pièces": -58,
};

function lookupModel(name: string): { category: HardwareCategory; base: number } {
  const found = HARDWARE_CATALOG.find((m) => m.name === name);
  if (found) return { category: found.category, base: found.base_price_eur };
  return { category: "GPU", base: 300 };
}

function computeVerdict(ratio: number): Verdict {
  if (ratio <= 0.82) return "FONCER";
  if (ratio <= 0.97) return "NÉGOCIER";
  if (ratio <= 1.1) return "TENTER";
  return "PASSER";
}

function computePercentilePosition(
  askPrice: number,
  dist: PercentileDistribution,
): number {
  const { p10, p25, p50, p75, p90 } = dist;
  const pts: [number, number][] = [
    [p10, 10],
    [p25, 25],
    [p50, 50],
    [p75, 75],
    [p90, 90],
  ];
  if (askPrice <= p10) return 5;
  if (askPrice >= p90) return 95;
  for (let i = 0; i < pts.length - 1; i++) {
    const [v1, r1] = pts[i];
    const [v2, r2] = pts[i + 1];
    if (askPrice >= v1 && askPrice <= v2) {
      return Math.round(r1 + ((askPrice - v1) / (v2 - v1)) * (r2 - r1));
    }
  }
  return 50;
}

function generatePriceHistory(
  p50Today: number,
  delta30dPct: number,
  n = 30,
): number[] {
  const startPrice = p50Today / (1 + delta30dPct / 100);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const trend = startPrice + (p50Today - startPrice) * t;
    const noise = (Math.random() - 0.5) * 2 * p50Today * 0.04;
    out.push(Math.round(trend + noise));
  }
  return out;
}

function buildTrendStatus(delta30: number): TrendStatus {
  if (delta30 > 2) return "En hausse";
  if (delta30 < -2) return "En baisse";
  return "Stable";
}

function buildLiquidityStatus(compositeLiq: number): LiquidityStatus {
  if (compositeLiq >= 75) return "Élevée";
  if (compositeLiq >= 50) return "Modérée";
  return "Faible";
}

function buildValueVsNewStatus(decotePct: number): ValueVsNewStatus {
  const abs = Math.abs(decotePct);
  if (abs >= 20) return "Forte";
  if (abs >= 10) return "Modérée";
  return "Faible";
}

function buildTrendNarrative(
  status: TrendStatus,
  delta30: number,
  category: HardwareCategory,
): string {
  const absDelta = Math.abs(delta30).toFixed(1);
  if (status === "En hausse") {
    return `Marché ${category} en hausse sur 30 j (+${absDelta} %). Acheter rapidement avant que les prix continuent de monter — bon timing.`;
  }
  if (status === "En baisse") {
    return `Marché ${category} en baisse sur 30 j (-${absDelta} %). Argument de négo fort : le vendeur sait que ça baisse.`;
  }
  return `Marché ${category} stable sur 30 j (±${absDelta} %). Pas d'urgence, pas d'opportunité particulière côté tendance.`;
}

function buildLiquidityNarrative(
  status: LiquidityStatus,
  sales: number,
  listings: number,
): string {
  if (status === "Élevée") {
    return `${sales} ventes / mois pour ${listings} annonces — rotation forte, revente rapide quasi assurée.`;
  }
  if (status === "Modérée") {
    return `${sales} ventes / mois pour ${listings} annonces — demande correcte, prévoir quelques jours pour revendre.`;
  }
  return `${sales} ventes / mois pour ${listings} annonces — marché lent, anticipe une revente sur plusieurs semaines.`;
}

function buildValueVsNewNarrative(
  status: ValueVsNewStatus,
  decote: number,
  state: ItemState,
): string {
  const abs = Math.abs(decote).toFixed(0);
  if (status === "Forte") {
    return `État ${state} — ${abs} % sous le prix neuf marché. Décote cohérente avec l'usure, marge confortable côté revente.`;
  }
  if (status === "Modérée") {
    return `État ${state} — ${abs} % sous le prix neuf marché. Décote correcte, attention aux frais et imprévus.`;
  }
  return `État ${state} — seulement ${abs} % sous le prix neuf marché. Décote faible, marge serrée côté revente.`;
}

function buildCategoryMarketStats(
  category: HardwareCategory,
  trend14d: number,
  compositeLiq: number,
  state: ItemState,
): CategoryMarketStats {
  const delta30 = parseFloat((trend14d * 1.5 + (Math.random() - 0.5) * 2).toFixed(1));
  const delta7 = parseFloat((delta30 * 0.4 + (Math.random() - 0.5) * 1.5).toFixed(1));
  const trendStatus = buildTrendStatus(delta30);

  const sales30d = Math.round(compositeLiq * 5 + (Math.random() - 0.5) * 30);
  const activeListings = Math.round(sales30d / 12 + 15 + (Math.random() - 0.5) * 8);
  const liquidityStatus = buildLiquidityStatus(compositeLiq);

  const baseDecote = STATE_DECOTE_PCT[state];
  const decote = parseFloat((baseDecote + (Math.random() - 0.5) * 4).toFixed(1));
  const valueVsNewStatus = buildValueVsNewStatus(decote);

  const finalSales = Math.max(20, sales30d);
  const finalListings = Math.max(8, activeListings);

  return {
    trend: {
      delta_7d_pct: delta7,
      delta_30d_pct: delta30,
      status: trendStatus,
      narrative: buildTrendNarrative(trendStatus, delta30, category),
    },
    liquidity: {
      sales_30d: finalSales,
      active_listings: finalListings,
      status: liquidityStatus,
      narrative: buildLiquidityNarrative(liquidityStatus, finalSales, finalListings),
    },
    value_vs_new: {
      decote_pct: decote,
      status: valueVsNewStatus,
      narrative: buildValueVsNewNarrative(valueVsNewStatus, decote, state),
    },
  };
}

export async function evaluate(
  inputs: EstimatorInputs,
): Promise<EstimatorResult> {
  await mockDelay(380);

  const { model, state, ask_price_eur, platform } = inputs;
  const { category, base } = lookupModel(model);

  const stateMult = STATE_MULTIPLIERS[state];
  const fair = Math.round(base * stateMult);
  const ratio = ask_price_eur / fair;
  const feesFrac = PLATFORM_FEES_PCT[platform] / 100;
  const netMargin = Math.round(fair * (1 - feesFrac) - ask_price_eur);

  const baseLiq = PLATFORM_LIQUIDITY[platform];
  const liq = Math.max(
    0.3,
    Math.min(0.95, baseLiq + (ratio < 0.9 ? 0.06 : 0) - (ratio > 1.1 ? 0.08 : 0)),
  );

  const verdict = computeVerdict(ratio);
  const confidence = Math.round(70 + (1 - Math.min(1, Math.abs(ratio - 1))) * 25);

  const p10 = Math.round(fair * 0.78);
  const p25 = Math.round(fair * 0.88);
  const p50 = fair;
  const p75 = Math.round(fair * 1.1);
  const p90 = Math.round(fair * 1.22);

  const trend = ratio < 0.95 ? 6 : ratio > 1.05 ? -4 : 2;
  const liqMod = liq > 0.7 ? 3 : liq > 0.55 ? 1 : -2;
  const valueVsNew =
    state === "Neuf"
      ? -3
      : state === "Comme neuf"
        ? -1
        : state === "Bon"
          ? 2
          : 4;

  const compositeLiquidity = Math.round(liq * 100);
  const distribution: PercentileDistribution = { p10, p25, p50, p75, p90 };
  const percentilePosition = computePercentilePosition(ask_price_eur, distribution);
  const categoryMarketStats = buildCategoryMarketStats(
    category,
    trend,
    compositeLiquidity,
    state,
  );
  const priceHistory = generatePriceHistory(
    p50,
    categoryMarketStats.trend.delta_30d_pct,
  );
  const observations = Math.round(compositeLiquidity * 5 + Math.random() * 50);

  return {
    inputs,
    model_name: model,
    category,
    verdict,
    confidence_pct: confidence,
    fair_price_eur: fair,
    net_margin_eur: netMargin,
    percentile_distribution: distribution,
    composite_score: {
      margin: Math.max(5, Math.min(95, 50 + (netMargin / fair) * 200)),
      liquidity: compositeLiquidity,
      affinity: PLATFORM_AFFINITY[platform],
    },
    modifiers: {
      trend_14d: trend,
      liquidity_mod: liqMod,
      value_vs_new: valueVsNew,
    },
    platform_fees_pct: PLATFORM_FEES_PCT[platform],
    evaluated_at: new Date().toISOString(),

    price_history_30d: priceHistory,
    percentile_position_pct: percentilePosition,
    observations_count: Math.max(80, observations),
    category_market_stats: categoryMarketStats,
  };
}
