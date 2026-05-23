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
import { HISTORY_STORAGE_KEY } from "../estimatorHistory";
import type { EstimatorHistoryEntry } from "../estimatorHistory";
import type {
  DashboardOverview,
  RecentEstimation,
  StatTileData,
  WatchlistItem,
} from "../../components/dashboard/datasets";

const RECENT_LIMIT = 8;
const WATCHLIST_PREVIEW_LIMIT = 4;

// ── Forme (partielle) de GET /v1/dashboard/overview réellement consommée ────
interface ApiOverview {
  credits: { balance: number };
  watchlist: Array<{
    id: number;
    target_type: "model" | "ad";
    target_id: number;
    created_at: string;
  }>;
}

// ── Accès localStorage (SSR-safe) ───────────────────────────────────────────
function loadLocalHistory(): EstimatorHistoryEntry[] {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EstimatorHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function isThisMonth(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
}

function toRecentEstimation(e: EstimatorHistoryEntry): RecentEstimation {
  return {
    id: e.id,
    model_name: e.result.model_name,
    category: e.result.category,
    verdict: e.result.verdict,
    listing_price_eur: e.inputs.ask_price_eur,
    net_margin_eur: e.result.net_margin_eur,
    created_at: new Date(e.ts).toISOString(),
  };
}

function buildStats(
  history: EstimatorHistoryEntry[],
  creditsBalance: number,
  watchlistCount: number,
): StatTileData[] {
  const monthEntries = history.filter((e) => isThisMonth(e.ts));
  const estimationsMonth = monthEntries.length;
  const margins = monthEntries
    .map((e) => e.result.net_margin_eur)
    .filter((m) => Number.isFinite(m));
  const avgMargin =
    margins.length > 0
      ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length)
      : 0;

  // Sparkline marges des dernières estimations (ordre chronologique), sinon plat.
  const marginSpark = history
    .slice(0, 7)
    .map((e) => Math.round(e.result.net_margin_eur))
    .reverse();

  return [
    {
      id: "estimations_month",
      label: "Estimations ce mois",
      value: estimationsMonth,
      delta_pct: null,
      sparkline: history.slice(0, 7).map((_, i) => i + 1).reverse(),
      format_hint: "integer",
      accent_color: "#3B82F6",
    },
    {
      id: "average_margin",
      label: "Marge nette moyenne",
      value: avgMargin,
      delta_pct: null,
      sparkline: marginSpark.length > 0 ? marginSpark : [0],
      format_hint: "euro",
      accent_color: "#10B981",
    },
    {
      id: "watchlist_count",
      label: "Watchlist",
      value: watchlistCount,
      delta_pct: null,
      sparkline: [watchlistCount],
      format_hint: "integer",
      accent_color: "#A855F7",
    },
    {
      id: "credits_remaining",
      label: "Crédits restants",
      value: creditsBalance,
      delta_pct: null,
      sparkline: [creditsBalance],
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

  const history = loadLocalHistory();
  const watchlistCount = overview.watchlist.length;

  const [watchlist_preview] = await Promise.all([buildWatchlistPreview(overview)]);

  return {
    stats: buildStats(history, overview.credits.balance, watchlistCount),
    recent_estimations: history.slice(0, RECENT_LIMIT).map(toRecentEstimation),
    watchlist_preview,
    generated_at: new Date().toISOString(),
  };
}
