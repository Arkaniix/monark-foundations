/**
 * Vraie implémentation Catalog API (mode réel, VITE_USE_MOCK_API=false).
 *
 * listModels / getAllModels : signaux liste via catalogSource (GET /v1/models).
 * getModelDetail : assemble une fiche RÉELLE à partir des endpoints marché
 *   - GET /v1/market/models/{id}/summary           → percentiles p10..p90, median_days_to_sell
 *   - GET /v1/market/models/{id}/history?bucket=... → sparkline 90 j + historique mensuel
 *   - GET /v1/market/models/{id}/listings-count     → ventilation par plateforme (annonces actives)
 * Plus aucune dérivation fabriquée : si un modèle n'a pas de CMS, la fiche
 * renvoie des sections vides (la page affiche "données insuffisantes").
 */

import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import { fetchAllCatalogModels } from "../catalogSource";
import { queryCatalog } from "../../components/catalog/filters";
import { buildVariants } from "../../components/catalog/modelDetail";
import { hasMarketData } from "../../components/catalog/datasets";
import { PLATFORM_FEES_PCT } from "../../components/catalog/modelDetail";
import type {
  CatalogFilters,
  CatalogListResponse,
  CatalogModel,
  CatalogSortKey,
} from "../../components/catalog/datasets";
import type {
  CatalogModelDetail,
  MonthlyHistoryEntry,
  PercentileDistribution,
  Platform,
  PlatformBreakdown,
} from "../../components/catalog/modelDetail";

export async function listModels(
  filters: CatalogFilters,
  sort: CatalogSortKey,
  page: number,
): Promise<CatalogListResponse> {
  const all = await fetchAllCatalogModels();
  return queryCatalog(all, filters, sort, page);
}

export async function getAllModels(): Promise<CatalogModel[]> {
  return fetchAllCatalogModels();
}

// ---------------------------------------------------------------------------
// Fiche détail (réelle)
// ---------------------------------------------------------------------------

interface ApiMarketSummary {
  price_median: number | null;
  price_p10: number | null;
  price_p25: number | null;
  price_p75: number | null;
  price_p90: number | null;
  median_days_to_sell: number | null;
  // 1a : état de suffisance renvoyé par le backend (la fiche arbitre via le modèle liste).
  state?: "reliable" | "insufficient" | "no_data" | null;
}
interface ApiHistoryPoint {
  date: string;
  price_median: number | null;
  ads_count: number | null;
  volume: number | null;
}
interface ApiHistoryResponse {
  points: ApiHistoryPoint[];
}
interface ApiPlatformEntry {
  platform: string;
  label: string;
  count: number;
  median_price: number | null;
}
interface ApiListingsCount {
  by_platform: ApiPlatformEntry[];
}

const MONTHS_FR = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUI", "JUI", "AOÛ", "SEP", "OCT", "NOV", "DÉC"];

function toPlatform(s: string): Platform | null {
  const k = (s || "").toLowerCase();
  if (k.includes("leboncoin") || k === "lbc") return "LBC";
  if (k.includes("vinted")) return "Vinted";
  if (k.includes("ebay")) return "eBay";
  return null;
}

function mapPercentiles(s: ApiMarketSummary | null): PercentileDistribution | null {
  if (!s) return null;
  const { price_p10, price_p25, price_median, price_p75, price_p90 } = s;
  if (
    price_p10 == null ||
    price_p25 == null ||
    price_median == null ||
    price_p75 == null ||
    price_p90 == null
  ) {
    return null;
  }
  return {
    p10: Math.round(price_p10),
    p25: Math.round(price_p25),
    p50: Math.round(price_median),
    p75: Math.round(price_p75),
    p90: Math.round(price_p90),
  };
}

function mapSparkline90d(hist: ApiHistoryResponse | null): number[] {
  return (hist?.points ?? [])
    .map((p) => p.price_median)
    .filter((v): v is number => v != null)
    .map((v) => Math.round(v));
}

function mapPlatforms(
  listings: ApiListingsCount | null,
  globalMedian: number,
): PlatformBreakdown[] {
  const out: PlatformBreakdown[] = [];
  for (const e of listings?.by_platform ?? []) {
    const platform = toPlatform(e.platform);
    if (!platform || e.median_price == null) continue;
    const price = Math.round(e.median_price);
    const fees = PLATFORM_FEES_PCT[platform];
    out.push({
      platform,
      median_eur: price,
      spread_vs_global_pct:
        globalMedian > 0 ? Math.round((price / globalMedian - 1) * 1000) / 10 : 0,
      n_obs: e.count,
      fees_pct: fees,
      net_median_eur: Math.round(price * (1 - fees / 100)),
    });
  }
  return out;
}

function mapMonthlyHistory(hist: ApiHistoryResponse | null): MonthlyHistoryEntry[] {
  const pts = (hist?.points ?? []).filter((p) => p.price_median != null);
  if (pts.length === 0) return [];
  const last = pts.slice(-6); // 6 derniers mois, chronologique (ancien → récent)
  const chrono: MonthlyHistoryEntry[] = last.map((p, i) => {
    const d = new Date(p.date);
    const label = `${MONTHS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    const prev = i === 0 ? null : (last[i - 1].price_median as number);
    const median = p.price_median as number;
    return {
      month_label: label,
      median_eur: Math.round(median),
      delta_pct: prev != null && prev !== 0 ? Math.round(((median - prev) / prev) * 1000) / 10 : 0,
      n_obs: p.ads_count ?? p.volume ?? 0,
      annotation: null,
    };
  });
  for (let i = 0; i < chrono.length; i++) {
    const prev = i === 0 ? null : chrono[i - 1].median_eur;
    const next = i === chrono.length - 1 ? null : chrono[i + 1].median_eur;
    if (prev != null && next != null) {
      if (chrono[i].median_eur > prev && chrono[i].median_eur > next) chrono[i].annotation = "peak";
      else if (chrono[i].median_eur < prev && chrono[i].median_eur < next)
        chrono[i].annotation = "trough";
    }
  }
  return chrono.reverse(); // la fiche attend l'ordre récent → ancien
}

const DETAIL_TTL_MS = 3 * 60 * 1000;
const detailCache = new Map<string, { at: number; detail: CatalogModelDetail }>();

export async function getModelDetail(id: string): Promise<CatalogModelDetail | null> {
  const cached = detailCache.get(id);
  if (cached && Date.now() - cached.at < DETAIL_TTL_MS) return cached.detail;

  const all = await fetchAllCatalogModels();
  const model = all.find((m) => m.id === id);
  if (!model) return null;

  const variants = buildVariants(model, all);

  // Pas de CMS → fiche en mode "données insuffisantes" (aucun appel marché).
  if (!hasMarketData(model)) {
    const detail: CatalogModelDetail = {
      ...model,
      percentiles: null,
      sparkline_90d: [],
      by_platform: [],
      monthly_history: [],
      variants,
      median_days_to_sell: null,
    };
    detailCache.set(id, { at: Date.now(), detail });
    return detail;
  }

  const [summary, histWeek, histMonth, listings] = await Promise.all([
    apiFetch<ApiMarketSummary>(ENDPOINTS.MARKET_SUMMARY(model.id)).catch(() => null),
    apiFetch<ApiHistoryResponse>(`${ENDPOINTS.MARKET_HISTORY(model.id)}?days=90&bucket=week`).catch(
      () => null,
    ),
    apiFetch<ApiHistoryResponse>(
      `${ENDPOINTS.MARKET_HISTORY(model.id)}?days=365&bucket=month`,
    ).catch(() => null),
    apiFetch<ApiListingsCount>(
      `${ENDPOINTS.MARKET_LISTINGS_COUNT(model.id)}?days=30`,
    ).catch(() => null),
  ]);

  const detail: CatalogModelDetail = {
    ...model,
    percentiles: mapPercentiles(summary),
    sparkline_90d: mapSparkline90d(histWeek),
    by_platform: mapPlatforms(listings, model.median_eur),
    monthly_history: mapMonthlyHistory(histMonth),
    variants,
    median_days_to_sell: summary?.median_days_to_sell ?? null,
  };
  detailCache.set(id, { at: Date.now(), detail });
  return detail;
}
