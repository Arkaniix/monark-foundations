/**
 * Type CatalogModelDetail et helper de dérivation depuis CatalogModel.
 * V1 : tout est dérivé du CatalogModel par fonctions pures déterministes.
 */

import type { CatalogModel } from "./datasets";

export type Platform = "LBC" | "Vinted" | "eBay";
export const FICHE_PLATFORMS: Platform[] = ["LBC", "Vinted", "eBay"];

export const PLATFORM_FEES_PCT: Record<Platform, number> = {
  LBC: 12,
  Vinted: 5,
  eBay: 18,
};

export const PLATFORM_BRAND_COLORS: Record<Platform, string> = {
  LBC: "#FF6E14",
  Vinted: "#09B1BA",
  eBay: "#0064D2",
};

const PLATFORM_PRICE_MULTIPLIER: Record<Platform, number> = {
  LBC: 0.94,
  Vinted: 0.97,
  eBay: 1.08,
};

export type PercentileDistribution = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

export type PlatformBreakdown = {
  platform: Platform;
  median_eur: number;
  spread_vs_global_pct: number;
  n_obs: number;
  fees_pct: number;
  net_median_eur: number;
};

export type MonthlyHistoryEntry = {
  month_label: string;
  median_eur: number;
  delta_pct: number;
  n_obs: number;
  annotation: "peak" | "trough" | null;
};

export type VariantEntry = {
  id: string;
  name: string;
  score: number;
  median_eur: number;
  trend_30d_pct: number;
  liquidity_pct: number;
  is_current: boolean;
};

export type CatalogModelDetail = CatalogModel & {
  percentiles: PercentileDistribution;
  sparkline_90d: number[];
  by_platform: PlatformBreakdown[];
  monthly_history: MonthlyHistoryEntry[];
  variants: VariantEntry[];
};

function buildPercentiles(median: number, liquidity_pct: number): PercentileDistribution {
  const spreadFactor = 0.08 + (1 - liquidity_pct / 100) * 0.32;
  return {
    p10: Math.round(median * (1 - spreadFactor)),
    p25: Math.round(median * (1 - spreadFactor * 0.5)),
    p50: Math.round(median),
    p75: Math.round(median * (1 + spreadFactor * 0.5)),
    p90: Math.round(median * (1 + spreadFactor)),
  };
}

function buildSparkline90d(
  sparkline_30d: number[],
  median: number,
  trend_30d_pct: number,
  seed: number,
): number[] {
  const olderPoints: number[] = [];
  const drift90d = (median * trend_30d_pct * 3) / 100;
  const noise = median * 0.025;
  let cur = median - drift90d;
  for (let i = 0; i < 18; i++) {
    const s = Math.sin(seed * 7.3 + i * 1.1) * noise;
    olderPoints.push(Math.round(cur + s));
    cur += drift90d / 18;
  }
  return [...olderPoints, ...sparkline_30d];
}

function buildPlatformBreakdown(median: number, n_obs_total: number): PlatformBreakdown[] {
  return FICHE_PLATFORMS.map((platform) => {
    const mult = PLATFORM_PRICE_MULTIPLIER[platform];
    const platformMedian = Math.round(median * mult);
    const spread = Math.round((mult - 1) * 1000) / 10;
    const fees = PLATFORM_FEES_PCT[platform];
    const netMedian = Math.round(platformMedian * (1 - fees / 100));
    const obsShare = platform === "LBC" ? 0.5 : platform === "eBay" ? 0.3 : 0.2;
    const platformObs = Math.round(n_obs_total * obsShare);
    return {
      platform,
      median_eur: platformMedian,
      spread_vs_global_pct: spread,
      n_obs: platformObs,
      fees_pct: fees,
      net_median_eur: netMedian,
    };
  });
}

function buildMonthlyHistory(
  median: number,
  trend_30d_pct: number,
  seed: number,
): MonthlyHistoryEntry[] {
  const MONTHS_FR = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUI", "JUI", "AOÛ", "SEP", "OCT", "NOV", "DÉC"];
  const currentMonthIdx = 4;
  const currentYear = 2026;
  const entries: MonthlyHistoryEntry[] = [];
  const prices: number[] = [];
  let cur = median;
  for (let i = 0; i < 6; i++) {
    const monthDrift = (-trend_30d_pct / 100) * median * 0.4;
    const noise = Math.sin(seed * 5 + i * 2.7) * median * 0.025;
    prices.push(Math.round(cur));
    cur += monthDrift + noise;
  }
  for (let i = 0; i < 6; i++) {
    const prev = i === 0 ? null : prices[i - 1];
    const next = i === 5 ? null : prices[i + 1];
    const monthOffset = currentMonthIdx - i;
    const year = monthOffset < 0 ? currentYear - 1 : currentYear;
    const monthIdx = ((monthOffset % 12) + 12) % 12;
    const label = `${MONTHS_FR[monthIdx]} ${year}`;
    const deltaPct = prev !== null ? ((prices[i] - prev) / prev) * 100 : 0;
    let annotation: MonthlyHistoryEntry["annotation"] = null;
    if (prev !== null && next !== null) {
      if (prices[i] > prev && prices[i] > next) annotation = "peak";
      else if (prices[i] < prev && prices[i] < next) annotation = "trough";
    }
    entries.push({
      month_label: label,
      median_eur: prices[i],
      delta_pct: Math.round(deltaPct * 10) / 10,
      n_obs: Math.round(800 + Math.sin(seed * 3 + i) * 100),
      annotation,
    });
  }
  return entries;
}

function buildVariants(currentModel: CatalogModel, allModels: CatalogModel[]): VariantEntry[] {
  return allModels
    .filter((m) => m.family === currentModel.family && m.category === currentModel.category)
    .sort((a, b) => b.score - a.score)
    .map((m) => ({
      id: m.id,
      name: m.name,
      score: m.score,
      median_eur: m.median_eur,
      trend_30d_pct: m.trend_30d_pct,
      liquidity_pct: m.liquidity_pct,
      is_current: m.id === currentModel.id,
    }));
}

export function buildModelDetail(
  model: CatalogModel,
  allModels: CatalogModel[],
): CatalogModelDetail {
  const seed = parseInt(model.id.replace(/[^0-9]/g, ""), 10) || 1;
  return {
    ...model,
    percentiles: buildPercentiles(model.median_eur, model.liquidity_pct),
    sparkline_90d: buildSparkline90d(model.sparkline_30d, model.median_eur, model.trend_30d_pct, seed),
    by_platform: buildPlatformBreakdown(model.median_eur, model.n_obs),
    monthly_history: buildMonthlyHistory(model.median_eur, model.trend_30d_pct, seed),
    variants: buildVariants(model, allModels),
  };
}