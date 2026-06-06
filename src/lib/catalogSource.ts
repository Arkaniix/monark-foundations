/**
 * Source partagée du catalogue (réel).
 *
 * Pourquoi un module séparé de src/lib/api/catalog.ts :
 *   - api/index.ts type chaque domaine par `typeof realCatalog`. Si on exportait
 *     des helpers supplémentaires (ex. getCatalogModelsByIds) depuis catalog.ts,
 *     le mock (mocks/catalog.ts) ne serait plus assignable → erreur TS.
 *   - On garde donc catalog.ts STRICTEMENT aligné sur le placeholder/mock
 *     (listModels + getModelDetail) et on met la mécanique réutilisable ici.
 *
 * Stratégie A (hybride) : les signaux marché viennent de l'API réelle
 * (médiane, fair value, var 7j/30j, liquidité, volume). Les 4 champs cosmétiques
 * absents de l'API (score, margin_pct, freshness_days, sparkline) sont dérivés
 * client-side avec EXACTEMENT les mêmes formules que le mock catalog, pour que
 * les cartes restent visuellement cohérentes entre mode mock et mode réel.
 *
 * Contraintes API confirmées :
 *   - GET /v1/models plafonne limit à 100 → pagination interne (≈7 pages pour 663
 *     modèles), mises en cache (TTL 5 min). Sous le rate-limit 30/min/IP.
 *   - Catégories API en UPPERCASE (MOTHERBOARD) → front en MOBO.
 */

import { apiFetch } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";
import type {
  CatalogModel,
  HardwareCategory,
  Manufacturer,
} from "../components/catalog/datasets";

/** Item brut renvoyé par GET /v1/models (enveloppe { items, total, limit, offset }). */
interface ApiModelListItem {
  id: number;
  name: string;
  brand: string | null;
  manufacturer: string | null;
  family: string | null;
  category: string; // "GPU" | "CPU" | "RAM" | "SSD" | "MOTHERBOARD" | "PSU"
  image_url: string | null;
  aliases: string[] | null;
  variants_count: number;
  fair_value_30d: number | null;
  price_median_30d: number | null;
  new_price_eur: number | null;
  var_7d_pct: number;
  var_30d_pct: number | null;
  volume: number;
  liquidity: number;
  liquidity_score: number;
  ads_count: number;
  // Phase 2 (null si pas de CMS)
  market_margin_pct: number | null;
  sparkline_30d: number[] | null;
  last_observed_at: string | null;
  composite_price: number | null;
  price_confidence: number | null;
  sold_count_30d: number | null;
  sold_count_90d: number | null;
  data_quality: "excellent" | "good" | "limited" | "insufficient" | null;
  state: "reliable" | "insufficient" | "no_data" | null;
}

interface ApiModelPage {
  items: ApiModelListItem[];
  total: number;
  limit: number;
  offset: number;
}

const API_TO_FRONT_CATEGORY: Record<string, HardwareCategory> = {
  GPU: "GPU",
  CPU: "CPU",
  RAM: "RAM",
  SSD: "SSD",
  MOTHERBOARD: "MOBO",
  PSU: "PSU",
};

// ---------------------------------------------------------------------------
// Score d'opportunité — composition front sur entrées RÉELLES (liquidité,
// marge marché backend, tendance). Plus aucune dérivation fabriquée ici :
// fraîcheur, sparkline et marge viennent désormais de l'API.
// ---------------------------------------------------------------------------

/** Score d'opportunité 0-100 : 40% liquidité / 35% marge / 25% tendance. */
function computeOpportunityScore(
  liquidity_pct: number,
  margin_pct: number,
  trend_30d_pct: number,
): number {
  const liq = Math.max(0, Math.min(100, liquidity_pct));
  const marge = Math.max(0, Math.min(100, (margin_pct / 25) * 100));
  const trend = Math.max(0, Math.min(100, 50 + trend_30d_pct * 5));
  return Math.round(liq * 0.4 + marge * 0.35 + trend * 0.25);
}

function mapApiModel(item: ApiModelListItem): CatalogModel {
  const median = item.price_median_30d ?? item.fair_value_30d ?? 0;
  const trend = item.var_30d_pct ?? item.var_7d_pct ?? 0;
  const liquidity_pct = Math.round((item.liquidity_score ?? item.liquidity ?? 0) * 100);
  const margin_pct = item.market_margin_pct ?? 0; // vraie marge backend (0 si pas de CMS)
  const medianRounded = Math.round(median);
  const trendRounded = Math.round(trend * 10) / 10;

  // Fraîcheur RÉELLE : jours depuis la dernière observation. null si inconnu.
  const freshness_days =
    item.last_observed_at != null
      ? Math.max(0, Math.floor((Date.now() - Date.parse(item.last_observed_at)) / 86_400_000))
      : null;

  return {
    id: String(item.id),
    name: item.name,
    category: API_TO_FRONT_CATEGORY[item.category] ?? "GPU",
    // L'API peut renvoyer manufacturer=null ou une valeur hors-union ; cast best-effort.
    manufacturer: (item.manufacturer ?? "") as Manufacturer,
    brand: item.brand ?? null,
    family: item.family ?? "",
    median_eur: medianRounded,
    trend_30d_pct: trendRounded,
    liquidity_pct,
    margin_pct,
    n_obs: item.sold_count_30d ?? item.volume ?? 0, // ventes réelles 30j (fallback échantillon)
    freshness_days,
    score: computeOpportunityScore(liquidity_pct, margin_pct, trend),
    // sparkline RÉELLE (null backend → [] : le composant Sparkline n'affiche rien).
    sparkline_30d: item.sparkline_30d ?? [],
    image_url: item.image_url ?? null,
    // Signaux Phase 2 (passe-plat)
    data_quality: item.data_quality ?? null,
    state: item.state ?? null,
    composite_price: item.composite_price ?? null,
    price_confidence: item.price_confidence ?? null,
    sold_count_30d: item.sold_count_30d ?? null,
    sold_count_90d: item.sold_count_90d ?? null,
    last_observed_at: item.last_observed_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// Cache + fetch paginé
// ---------------------------------------------------------------------------

const TTL_MS = 5 * 60 * 1000;
const PAGE_LIMIT = 1000; // plafond API relevé (Phase 2 backend) → catalogue en 1 requête

let cache: { at: number; models: CatalogModel[] } | null = null;
let inflight: Promise<CatalogModel[]> | null = null;

async function fetchPage(offset: number): Promise<ApiModelPage> {
  return apiFetch<ApiModelPage>(
    `${ENDPOINTS.MODELS}?limit=${PAGE_LIMIT}&offset=${offset}`,
    { method: "GET" },
  );
}

/**
 * Récupère TOUS les modèles (paginé), mappés en CatalogModel, avec cache TTL.
 * Permet à queryCatalog() de filtrer/trier/paginer client-side exactement comme
 * le mock — y compris le tri par score (que l'API ne sait pas faire côté serveur).
 */
export async function fetchAllCatalogModels(force = false): Promise<CatalogModel[]> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache.models;
  if (inflight) return inflight;

  inflight = (async () => {
    const all: CatalogModel[] = [];
    let offset = 0;
    let total = Number.POSITIVE_INFINITY;
    while (offset < total) {
      const page = await fetchPage(offset);
      total = Number.isFinite(page.total) ? page.total : all.length + page.items.length;
      for (const it of page.items) all.push(mapApiModel(it));
      if (page.items.length < PAGE_LIMIT) break;
      offset += PAGE_LIMIT;
      if (offset > 5000) break; // garde-fou
    }
    cache = { at: Date.now(), models: all };
    return all;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Résout une liste d'ids modèle (string) en CatalogModel via le cache. Utilisé par le dashboard (watchlist). */
export async function getCatalogModelsByIds(ids: string[]): Promise<CatalogModel[]> {
  const all = await fetchAllCatalogModels();
  const want = new Set(ids.map((x) => String(x)));
  return all.filter((m) => want.has(m.id));
}

/** Invalide le cache (ex. après une mutation watchlist). */
export function invalidateCatalogCache(): void {
  cache = null;
}
