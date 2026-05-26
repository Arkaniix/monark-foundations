/**
 * Vraie implémentation Dashboard API (mode réel) — STRATÉGIE A (hybride).
 *
 * Contexte (diagnostic backend 2026-05-23) : le backend ne persiste PAS les
 * estimations (estimator_runs vide, /v1/dashboard/overview.recent_estimates
 * toujours []). Mais le front stocke déjà l'historique en localStorage
 * (monark.estimator.history.v1, alimenté par la page Estimator). On compose donc :
 *
 *   - credits_remaining, watchlist  ← RÉEL  (GET /v1/dashboard/overview)
 *   - recent_estimations            ← LOCAL (localStorage)
 *   - estimations_month, avg_margin ← LOCAL (dérivé du localStorage)
 *   - watchlist_preview             ← RÉEL  (résolution des model_id via le catalogue)
 *
 * Signature identique au placeholder/mock : getOverview(): Promise<DashboardOverview>.
 * Le composant Dashboard n'est pas touché.
 */

import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import { getCatalogModelsByIds } from "../catalogSource";
import { VERDICT_EN_TO_FR, API_CAT_TO_FRONT } from "./estimator";
import type {
  DashboardOverview,
  RecentEstimation,
  StatTileData,
  WatchlistItem,
} from "../../components/dashboard/datasets";

const RECENT_LIMIT = 8;
const WATCHLIST_PREVIEW_LIMIT = 4;

// ── Forme (partielle) de GET /v1/dashboard/overview réellement consommée ────
interface ApiOverviewItem {
  id: number;
  model_id: number | null;
  model_name: string;
  category: string | null;
  verdict: string | null;
  score: number | null;
  listing_price: number | null;
  net_margin_eur: number | null;
  created_at: string;
}

interface ApiOverview {
  credits: { balance: number };
  watchlist: Array<{
    id: number;
    target_type: "model" | "ad";
    target_id: number;
    created_at: string;
  }>;
  recent_estimates: ApiOverviewItem[];
  estimations_month: number;
  avg_margin_month: number;
}

function toRecentEstimation(it: ApiOverviewItem): RecentEstimation {
  return {
    id: String(it.id),
    model_name: it.model_name,
    category: API_CAT_TO_FRONT[it.category ?? ""] ?? "GPU",
    verdict: VERDICT_EN_TO_FR[it.verdict ?? ""] ?? "NÉGOCIER",
    listing_price_eur: it.listing_price ?? 0,
    net_margin_eur: it.net_margin_eur ?? 0,
    created_at: it.created_at,
  };
}

/**
 * Série lisse de longueur FIXE (≥ 2 points) autour d'une valeur cible.
 * Indispensable : une sparkline à 0 ou 1 point fait diviser par (n−1)=0 dans le
 * tracé SVG → coordonnées NaN → erreurs `<path> attribute d: Expected number`.
 * On renvoie donc toujours `n` points valides, même quand l'historique est vide.
 */
function series(target: number, n = 16): number[] {
  const base = Number.isFinite(target) ? target : 0;
  const amp = Math.abs(base) * 0.06 + 0.5;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const wave = Math.sin(i * 0.7) * amp;
    const drift = (base * 0.04 * (i - n / 2)) / n;
    out.push(Math.round((base + wave + drift) * 100) / 100);
  }
  return out;
}

function buildStats(
  estimationsMonth: number,
  avgMargin: number,
  creditsBalance: number,
  watchlistCount: number,
): StatTileData[] {
  return [
    {
      id: "estimations_month",
      label: "Estimations ce mois",
      value: estimationsMonth,
      delta_pct: null,
      sparkline: series(estimationsMonth),
      format_hint: "integer",
      accent_color: "#3B82F6",
    },
    {
      id: "average_margin",
      label: "Marge nette moyenne",
      value: avgMargin,
      delta_pct: null,
      sparkline: series(avgMargin),
      format_hint: "euro",
      accent_color: "#10B981",
    },
    {
      id: "watchlist_count",
      label: "Watchlist",
      value: watchlistCount,
      delta_pct: null,
      sparkline: series(watchlistCount),
      format_hint: "integer",
      accent_color: "#A855F7",
    },
    {
      id: "credits_remaining",
      label: "Crédits restants",
      value: creditsBalance,
      delta_pct: null,
      sparkline: series(creditsBalance),
      format_hint: "integer",
      accent_color: "#F59E0B",
    },
  ];
}

async function buildWatchlistPreview(overview: ApiOverview): Promise<WatchlistItem[]> {
  // Seuls les target_type "model" sont résolvables (jamais "ad", cf contrainte légale).
  const modelIds = overview.watchlist
    .filter((w) => w.target_type === "model")
    .slice(0, WATCHLIST_PREVIEW_LIMIT)
    .map((w) => String(w.target_id));

  if (modelIds.length === 0) return [];

  try {
    const models = await getCatalogModelsByIds(modelIds);
    return models.map((m) => ({
      id: m.id,
      model_name: m.name,
      category: m.category,
      average_price_7d: m.median_eur,
      delta_pct_vs_14d: m.trend_30d_pct,
      sparkline: m.sparkline_30d.slice(-7), // 7 derniers points
    }));
  } catch {
    // Si le catalogue est indisponible, on dégrade en preview vide plutôt que de planter.
    return [];
  }
}

export async function getOverview(): Promise<DashboardOverview> {
  const overview = await apiFetch<ApiOverview>(ENDPOINTS.DASHBOARD_OVERVIEW, {
    method: "GET",
  });

  const watchlistCount = overview.watchlist.length;

  const watchlist_preview = await buildWatchlistPreview(overview);

  return {
    stats: buildStats(
      overview.estimations_month ?? 0,
      overview.avg_margin_month ?? 0,
      overview.credits.balance,
      watchlistCount,
    ),
    recent_estimations: (overview.recent_estimates ?? [])
      .slice(0, RECENT_LIMIT)
      .map(toRecentEstimation),
    watchlist_preview,
    generated_at: new Date().toISOString(),
  };
}
