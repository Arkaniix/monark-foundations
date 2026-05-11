/**
 * Mock implementation Dashboard API.
 *
 * Étendu en C2a avec `recent_estimations` : 5 dernières estimations fictives
 * couvrant les 6 catégories et les 4 verdicts pour montrer la variété visuelle.
 *
 * Les modèles sont des références réelles du marché (RTX 4070 SUPER, 7800X3D,
 * DDR5-6000, etc.) mais sans données d'annonces individuelles — uniquement
 * des prix synthétiques cohérents (cf. component_market_stats backend Monark).
 */

import { mockDelay, MOCK_USER } from "./fixtures";
import type {
  DashboardOverview,
  StatTileData,
  RecentEstimation,
} from "../../components/dashboard/datasets";

function generateSeries(target: number, n: number, amplitude = 0.12): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const trend = (i / n) * target * 0.05;
    const noise = (Math.random() - 0.5) * 2 * target * amplitude;
    out.push(Math.max(0, target + trend + noise));
  }
  return out;
}

const PLAN_CAPS = { free: 10, standard: 180, pro: 600 } as const;

/**
 * Dates relatives par rapport à "maintenant" pour que la table garde une
 * cohérence temporelle même si elle est rendue plusieurs fois ("il y a 2h"
 * doit rester "il y a 2h" et pas "il y a une semaine").
 */
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

const MOCK_RECENT_ESTIMATIONS: RecentEstimation[] = [
  {
    id: "est_01",
    model_name: "RTX 4070 SUPER",
    category: "GPU",
    verdict: "FONCER",
    listing_price_eur: 480,
    net_margin_eur: 95,
    created_at: hoursAgo(2),
  },
  {
    id: "est_02",
    model_name: "7800X3D",
    category: "CPU",
    verdict: "NÉGOCIER",
    listing_price_eur: 320,
    net_margin_eur: 42,
    created_at: hoursAgo(8),
  },
  {
    id: "est_03",
    model_name: "DDR5-6000 32GB",
    category: "RAM",
    verdict: "TENTER",
    listing_price_eur: 110,
    net_margin_eur: 18,
    created_at: hoursAgo(26),
  },
  {
    id: "est_04",
    model_name: "RTX 4090",
    category: "GPU",
    verdict: "PASSER",
    listing_price_eur: 1850,
    net_margin_eur: -45,
    created_at: hoursAgo(48),
  },
  {
    id: "est_05",
    model_name: "B650 TOMAHAWK",
    category: "MOBO",
    verdict: "FONCER",
    listing_price_eur: 140,
    net_margin_eur: 35,
    created_at: hoursAgo(72),
  },
];

export async function getOverview(): Promise<DashboardOverview> {
  await mockDelay(280);

  const creditsCap = PLAN_CAPS[MOCK_USER.subscription_tier];
  const creditsRemaining = MOCK_USER.credits_remaining;
  const creditsColor =
    creditsRemaining / creditsCap > 0.5
      ? "#10B981"
      : creditsRemaining / creditsCap > 0.2
        ? "#F59E0B"
        : "#EF4444";

  const stats: StatTileData[] = [
    {
      id: "estimations_month",
      label: "ESTIMATIONS CE MOIS",
      value: 12,
      delta_pct: 33.3,
      sparkline: generateSeries(0.4, 30, 0.4),
      format_hint: "integer",
      accent_color: "#3B82F6",
    },
    {
      id: "average_margin",
      label: "MARGE MOYENNE",
      value: 85,
      delta_pct: 8.2,
      sparkline: generateSeries(85, 30, 0.18),
      format_hint: "euro",
      accent_color: "#10B981",
    },
    {
      id: "watchlist_count",
      label: "MODÈLES SUIVIS",
      value: 27,
      delta_pct: 12.5,
      sparkline: generateSeries(25, 30, 0.08),
      format_hint: "integer",
      accent_color: "#3B82F6",
    },
    {
      id: "credits_remaining",
      label: "CRÉDITS RESTANTS",
      value: creditsRemaining,
      delta_pct: null,
      sparkline: generateSeries(creditsRemaining, 30, 0.05),
      format_hint: "ratio",
      accent_color: creditsColor,
    },
  ];

  return {
    stats,
    recent_estimations: MOCK_RECENT_ESTIMATIONS,
    generated_at: new Date().toISOString(),
  };
}
