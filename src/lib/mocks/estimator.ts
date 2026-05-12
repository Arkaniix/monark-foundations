/**
 * Mock Estimator API — logique reseller portée depuis landing/estimator.ts.
 */

import { mockDelay } from "./fixtures";
import {
  HARDWARE_CATALOG,
  PLATFORM_FEES_PCT,
  type EstimatorInputs,
  type EstimatorResult,
  type HardwareCategory,
  type ItemState,
  type Platform,
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

function lookupModel(name: string): {
  category: HardwareCategory;
  base: number;
} {
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
    Math.min(
      0.95,
      baseLiq + (ratio < 0.9 ? 0.06 : 0) - (ratio > 1.1 ? 0.08 : 0),
    ),
  );

  const verdict = computeVerdict(ratio);
  const confidence = Math.round(
    70 + (1 - Math.min(1, Math.abs(ratio - 1))) * 25,
  );

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

  return {
    inputs,
    model_name: model,
    category,
    verdict,
    confidence_pct: confidence,
    fair_price_eur: fair,
    net_margin_eur: netMargin,
    percentile_distribution: { p10, p25, p50, p75, p90 },
    composite_score: {
      margin: Math.max(5, Math.min(95, 50 + (netMargin / fair) * 200)),
      liquidity: Math.round(liq * 100),
      affinity: PLATFORM_AFFINITY[platform],
    },
    modifiers: {
      trend_14d: trend,
      liquidity_mod: liqMod,
      value_vs_new: valueVsNew,
    },
    platform_fees_pct: PLATFORM_FEES_PCT[platform],
    evaluated_at: new Date().toISOString(),
  };
}