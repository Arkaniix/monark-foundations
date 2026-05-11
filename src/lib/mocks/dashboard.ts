/**
 * Mock implementation Dashboard API.
 *
 * Étendu en C2b avec `watchlist_preview` : 4 modèles suivis fictifs montrant
 * la diversité (différentes catégories, deltas mixtes positifs/négatifs).
 */

import { mockDelay, MOCK_USER } from "./fixtures";
import type {
  DashboardOverview,
  StatTileData,
  RecentEstimation,
  WatchlistItem,
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

const MOCK_WATCHLIST_PREVIEW: WatchlistItem[] = [
  {
    id: "wl_01",
    model_name: "RTX 4080 SUPER",
    category: "GPU",
    average_price_7d: 920,
    delta_pct_vs_14d: -3.8,
    sparkline: generateSeries(920, 7, 0.04),
  },
  {
    id: "wl_02",
    model_name: "7900X3D",
    category: "CPU",
    average_price_7d: 425,
    delta_pct_vs_14d: 2.1,
    sparkline: generateSeries(425, 7, 0.03),
  },
  {
    id: "wl_03",
    model_name: "990 PRO 2TB",
    category: "SSD",
    average_price_7d: 165,
    delta_pct_vs_14d: -7.2,
    sparkline: generateSeries(165, 7, 0.06),
  },
  {
    id: "wl_04",
    model_name: "X670E HERO",
    category: "MOBO",
    average_price_7d: 380,
    delta_pct_vs_14d: 0.4,
    sparkline: generateSeries(380, 7, 0.02),
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
    watchlist_preview: MOCK_WATCHLIST_PREVIEW,
    generated_at: new Date().toISOString(),
  };
}
