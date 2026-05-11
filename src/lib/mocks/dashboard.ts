/**
 * Mock implementation Dashboard API.
 *
 * Retourne un overview synthétique cohérent avec MOCK_USER (89/180 crédits)
 * et représentatif de ce qu'un user pro standard verrait après quelques mois
 * d'utilisation : ~12 estimations/mois, marge moyenne ~85€, watchlist
 * d'une trentaine de modèles suivis.
 *
 * Les sparklines 30 jours sont générées avec une légère variabilité pour
 * paraître naturelles sans être trop bruyantes — moyenne stable + bruit
 * gaussien ±10%.
 */

import { mockDelay } from "./fixtures";
import { MOCK_USER } from "./fixtures";
import type {
  DashboardOverview,
  StatTileData,
} from "../../components/dashboard/datasets";

/**
 * Génère une série de N points oscillant autour d'une valeur cible.
 * Utilisé pour les sparklines 30 jours. Variabilité ±amplitude%.
 */
function generateSeries(target: number, n: number, amplitude = 0.12): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    // Légère tendance + bruit
    const trend = (i / n) * target * 0.05;
    const noise = (Math.random() - 0.5) * 2 * target * amplitude;
    out.push(Math.max(0, target + trend + noise));
  }
  return out;
}

const PLAN_CAPS = { free: 10, standard: 180, pro: 600 } as const;

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
    generated_at: new Date().toISOString(),
  };
}
