/**
 * Vraie implémentation Estimator API (mode réel) — STRATÉGIE A (hybride).
 *
 * Le front ne fait que du mode "component" (EstimatorInputs n'a pas de bundle).
 * Pipeline :
 *   1. inputs.model est un NOM → résolution en model_id via /v1/models/autocomplete.
 *   2. POST /v1/estimator/evaluate (mode component, level "complete").
 *   3. Mapping de la réponse réelle vers EstimatorResult.
 *
 * RÉEL (mappé tel quel depuis l'API) : verdict (EN→FR), fair value, médiane,
 * distribution p10-p90, percentile, trends, liquidité, volatilité, modifiers,
 * score, et les chiffres de négociation (offre agressive / compromis / max,
 * arguments, tip).
 *
 * DÉRIVÉ (l'API ne le sert pas au niveau "complete" — resale gated pro, et
 * certains blocs propres au front V2) : resale_where, resale_when, le 3e palier
 * de négo "cordial", composite_score, landmarks, data_quality, price_history_30d.
 * Tout est dérivé de façon déterministe à partir des signaux réels — cosmétique
 * posé sur du réel, cohérent avec le reste de la stratégie A.
 *
 * Robustesse : chaque bloc API est optionnel-chained avec fallback dérivé, donc
 * le client tient même si le plan de l'utilisateur downgrade le level (basic →
 * réponse plus pauvre).
 */

import { apiFetch, ApiException } from "./client";
import { ENDPOINTS } from "./endpoints";
import {
  PLATFORM_FEES_PCT,
  PLATFORMS,
  NEGOTIATION_KEYWORDS,
} from "../../components/estimator/datasets";
import type { EstimatorHistoryEntry } from "../estimatorHistory";
import type {
  EstimatorInputs,
  EstimatorResult,
  ItemState,
  Platform,
  Verdict,
  HardwareCategory,
  PercentileDistribution,
  NegotiationOffer,
  NegotiationArgument,
  NegotiationPlan,
  StrategyMode,
  CategoryMarketStats,
  TrendStatus,
  LiquidityStatus,
  ValueVsNewStatus,
  PlatformResaleStats,
  ResaleWhereRecommendation,
  ResaleWhenOption,
  ResaleWhenRecommendation,
  DataQuality,
  Likelihood,
  SellResult,
  SellStrategy,
  SellPlatform,
  SellStrategyTier,
  AnyEstimatorResult,
  DecayStep,
  SellProjection,
  SellPresentation,
  PricingBasis,
} from "../../components/estimator/datasets";

// ── Maps front → API ────────────────────────────────────────────────────────

const VALID_STRATEGY_MODES: StrategyMode[] = ["secure_deal", "negotiate", "lowball", "walk"];

const STATE_TO_CONDITION: Record<ItemState, string> = {
  Neuf: "new",
  "Comme neuf": "like_new",
  Bon: "good",
  Acceptable: "occasion",
  "Pour pièces": "for_parts",
};

const PLATFORM_TO_API: Record<Platform, string> = {
  LBC: "leboncoin",
  Vinted: "vinted",
  eBay: "ebay",
};

const CONDITION_TO_STATE: Record<string, ItemState> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon",
  occasion: "Acceptable",
  for_parts: "Pour pièces",
};

const API_PLATFORM_TO_FRONT: Record<string, Platform> = {
  leboncoin: "LBC",
  vinted: "Vinted",
  ebay: "eBay",
};

export const VERDICT_EN_TO_FR: Record<string, Verdict> = {
  BUY: "FONCER",
  NEGOTIATE: "NÉGOCIER",
  LOWBALL: "TENTER",
  AVOID: "PASSER",
};

export const API_CAT_TO_FRONT: Record<string, HardwareCategory> = {
  GPU: "GPU",
  CPU: "CPU",
  RAM: "RAM",
  SSD: "SSD",
  MOTHERBOARD: "MOBO",
  PSU: "PSU",
};

const PLATFORM_AFFINITY: Record<Platform, number> = { LBC: 85, Vinted: 60, eBay: 75 };

function mapLikelihood(s: string | undefined): Likelihood {
  const v = (s ?? "").toLowerCase();
  if (v.includes("élev") || v.includes("elev") || v === "high") return "élevée";
  if (v.includes("faib") || v === "low") return "faible";
  return "modérée";
}

// ── Forme (partielle) de POST /v1/estimator/evaluate (mode component) ───────
interface ApiResalePlatform {
  listing_price?: number;
  recommended_price?: number;
  seller_net_price?: number;
  seller_fees_pct?: number;
  net_margin_eur?: number;
  margin_eur?: number;
  net_margin_pct?: number;
  est_sell_days?: number;
  est_sell_days_basis?: string;
  composite_score?: number;
  is_recommended?: boolean;
  note?: string | null;
  tip?: string | null;
  data_source_tier?: number;
  data_confidence?: "low" | "medium" | "high";
}
interface ApiScenario {
  sell_price?: number;
  margin_eur?: number;
  est_days?: number;
  probability_pct?: number;
  likelihood?: string;
}
interface ApiNegotiationOffer {
  type?: string;
  label?: string;
  price?: number;
  likelihood?: string;
}
interface ApiEvaluateResponse {
  estimation_id: string;
  created_at: string;
  model?: { id: number; name: string; category: string; manufacturer?: string; image_url?: string };
  score: {
    overall: number;
    verdict: string;
    confidence: { score: number; factors?: string[] };
    base_score?: number;
    percentile_rank?: number;
    modifiers?: { trend?: number; liquidity?: number; value_vs_new?: number; total_raw?: number; total_adjusted?: number };
  };
  market?: {
    median_price?: number;
    fair_value?: number | null;
    percentile_rank?: number;
    distribution?: PercentileDistribution | null;
    sold_distribution?: PercentileDistribution | null;
    asking_distribution?: PercentileDistribution | null;
    sold_histogram?: { bin_min: number; bin_max: number; count: number }[] | null;
    positioning_basis?: string;
    new_price?: number | null;
    new_price_reliable?: boolean;
    used_to_new_ratio?: number | null;
    shortage_signal?: boolean;
    discount_vs_new_pct?: number | null;
    trend_30d_pct?: number | null;
  };
  trends?: { trend_7d_pct?: number | null; trend_30d_pct?: number | null; momentum?: string; momentum_label?: string; interpretation?: string };
  liquidity?: { score?: number; sold_30d?: number; active_listings?: number; interpretation?: string };
  negotiation?: {
    offers?: ApiNegotiationOffer[];
    seller_motivation?: { level: string; age_days: number; narrative: string };
    aggressive_offer?: number;
    compromise_offer?: number;
    max_price?: number;
    savings_aggressive_eur?: number;
    savings_compromise_eur?: number;
    arguments?: string[];
    tip?: string;
    reflexes?: { opportunity?: string[]; red_flag?: string[] };
    strategy_mode?: string;
  };
  resale?: {
    best_platform?: string | null;
    platforms?: Record<string, ApiResalePlatform>;
    ranked_order?: string[];
    vinted_excluded?: boolean;
  };
  scenarios?: {
    quick?: ApiScenario;
    optimal?: ApiScenario;
    patient?: ApiScenario;
  };
  warnings?: {
    code: string;
    severity: "danger" | "warning";
    message: string;
    headline?: string;
    delta_vs_market_pct?: number;
    scam_signals?: string[];
    verification_steps?: string[];
    recommended_action?: "buy_now" | "verify_then_buy" | "avoid";
    action_rationale?: string;
  }[];
  primary_risk?: unknown;
  // F2a — Mode VENTE
  flow?: string;
  status?: string;
  strategies?: {
    rapide?: ApiSellStrategy;
    optimal?: ApiSellStrategy;
    patient?: ApiSellStrategy;
  };
  platform_reco?: {
    best_platform?: string | null;
    ranked_order?: string[];
    vinted_excluded?: boolean;
    platforms?: Record<string, ApiSellPlatform>;
  };
  decay_schedule?: {
    day?: number;
    strategy?: "patient" | "optimal" | "rapide";
    price?: number;
  }[];
  projection?: {
    timing?: "good" | "neutral" | "cautious" | "bad";
    trend_30d_pct?: number | null;
    projected_patient_value?: number | null;
    narrative?: string;
  };
  presentation?: {
    completeness?: string[];
    terms_to_avoid?: string[];
    terms_to_favor?: string[];
    condition_framing?: string;
    category_tip?: string;
  };
  pricing_basis?: {
    platform?: string;
    data_source_tier?: 1 | 2 | 3;
    data_confidence?: "high" | "medium" | "low";
    data_source?: string;
  };
}

interface ApiSellStrategy {
  listing_price?: number;
  net_price?: number;
  est_days?: number;
  likelihood?: string;
  profit_eur?: number;
  profit_pct?: number;
}

interface ApiSellPlatform {
  seller_net_price?: number;
  seller_fees_pct?: number;
  net_margin_eur?: number;
  net_margin_pct?: number;
  is_recommended?: boolean;
  est_sell_days?: number;
  est_sell_days_basis?: string;
  data_confidence?: "low" | "medium" | "high";
  note?: string | null;
  tip?: string | null;
}

interface AutocompleteItem {
  id: number;
  name: string;
  label: string;
}

// ── Helpers de statut (alignés sur le mock) ─────────────────────────────────

function trendStatus(delta30: number, momentum?: string): TrendStatus {
  if (momentum) {
    const m = momentum.toLowerCase();
    if (m.includes("up") || m.includes("haus") || m.includes("rising")) return "En hausse";
    if (m.includes("down") || m.includes("bais") || m.includes("fall")) return "En baisse";
    if (m.includes("stable")) return "Stable";
  }
  return delta30 > 2 ? "En hausse" : delta30 < -2 ? "En baisse" : "Stable";
}

function liquidityStatus(score0to1: number): LiquidityStatus {
  const pct = score0to1 * 100;
  return pct >= 75 ? "Élevée" : pct >= 50 ? "Modérée" : "Faible";
}

function valueVsNewStatus(decotePct: number): ValueVsNewStatus {
  const a = Math.abs(decotePct);
  return a >= 20 ? "Forte" : a >= 10 ? "Modérée" : "Faible";
}

function argCategory(s: string): NegotiationArgument["category"] {
  const l = s.toLowerCase();
  if (l.includes("médiane") || l.includes("marché") || l.includes("prix")) return "marché";
  if (l.includes("annonce") || l.includes("alternative") || l.includes("concurren")) return "concurrence";
  if (l.includes("état") || l.includes("condition")) return "état";
  return "position";
}

function parseDataQuality(factors: string[] | undefined): DataQuality {
  const f = factors ?? [];
  let observations_count = 0;
  for (const s of f) {
    const m = s.match(/(\d[\d\s]*)\s*observ/i);
    if (m) {
      observations_count = parseInt(m[1].replace(/\s/g, ""), 10);
      break;
    }
  }
  return {
    observations_count,
    fresh_within_hours: f.some((s) => /48\s*h/i.test(s)) ? 48 : 168,
    platform_specific: f.some((s) => /plateforme/i.test(s)),
  };
}

// ── Mapping revente réelle (level pro) ───────────────────────────────────────

const RESALE_API_TO_FRONT: Record<string, Platform> = {
  leboncoin: "LBC",
  vinted: "Vinted",
  ebay: "eBay",
};

function mapResaleWhere(
  resp: ApiEvaluateResponse,
  ask: number,
): ResaleWhereRecommendation | undefined {
  const r = resp.resale;
  if (!r || !r.platforms) return undefined;
  const order = r.ranked_order ?? Object.keys(r.platforms);
  const platforms: PlatformResaleStats[] = [];
  for (const key of order) {
    const p = r.platforms[key];
    const front = RESALE_API_TO_FRONT[key];
    if (!p || !front) continue;
    platforms.push({
      platform: front,
      estimated_price_eur: Math.round(p.listing_price ?? p.recommended_price ?? 0),
      fees_pct: p.seller_fees_pct ?? 0,
      net_margin_eur: Math.round(p.net_margin_eur ?? p.margin_eur ?? 0),
      expected_delay_days: p.est_sell_days ?? 0,
      recommendation_score: Math.round(p.composite_score ?? 0),
      is_top_pick: Boolean(p.is_recommended),
      narrative: p.tip ?? p.note ?? "",
      data_confidence: p.data_confidence,
      seller_net_price:
        typeof p.seller_net_price === "number" ? p.seller_net_price : undefined,
    });
  }
  if (platforms.length === 0) return undefined;
  if (!platforms.some((p) => p.is_top_pick)) platforms[0].is_top_pick = true;
  const top = platforms.find((p) => p.is_top_pick) ?? platforms[0];
  return {
    cost_basis_eur: Math.round(ask),
    platforms,
    top_pick_narrative: `${top.platform} maximise la marge nette (~${top.net_margin_eur} €).`,
  };
}

const SCENARIO_NARRATIVE: Record<ResaleWhenOption["timing"], string> = {
  RAPIDE: "Vente rapide, prix bas mais liquidité immédiate.",
  OPTIMAL: "Meilleur compromis prix / délai.",
  PATIENT: "Prix maximal au prix d'un délai plus long.",
};

function mapResaleWhen(
  resp: ApiEvaluateResponse,
): ResaleWhenRecommendation | undefined {
  const s = resp.scenarios;
  if (!s) return undefined;
  const mk = (
    timing: ResaleWhenOption["timing"],
    sc: ApiScenario | undefined,
    isTop: boolean,
  ): ResaleWhenOption => ({
    timing,
    expected_price_eur: Math.round(sc?.sell_price ?? 0),
    expected_delay_days: sc?.est_days ?? 0,
    likelihood: mapLikelihood(sc?.likelihood),
    net_margin_eur: Math.round(sc?.margin_eur ?? 0),
    is_top_pick: isTop,
    narrative: SCENARIO_NARRATIVE[timing],
  });
  const options: ResaleWhenOption[] = [
    mk("RAPIDE", s.quick, false),
    mk("OPTIMAL", s.optimal, true),
    mk("PATIENT", s.patient, false),
  ];
  const by_platform = {} as Record<Platform, ResaleWhenOption[]>;
  for (const p of PLATFORMS) by_platform[p] = options;
  return { by_platform };
}

// ── Résolution nom → model_id ────────────────────────────────────────────────

async function resolveModelId(name: string): Promise<number> {
  const q = name.trim();
  if (!q) throw new ApiException(400, "Aucun modèle fourni", "EMPTY_MODEL");
  const items = await apiFetch<AutocompleteItem[]>(
    `${ENDPOINTS.MODELS_AUTOCOMPLETE}?q=${encodeURIComponent(q)}&limit=10`,
    { method: "GET" },
  );
  if (!items.length) {
    throw new ApiException(404, `Modèle introuvable : « ${name} »`, "MODEL_NOT_FOUND");
  }
  const lower = q.toLowerCase();
  const match =
    items.find((i) => i.name.toLowerCase() === lower) ??
    items.find((i) => i.label.toLowerCase().includes(lower)) ??
    items[0];
  return match.id;
}

// ── Mapping réponse → EstimatorResult ────────────────────────────────────────

function mapResponse(inputs: EstimatorInputs, resp: ApiEvaluateResponse): EstimatorResult {
  const ask = inputs.ask_price_eur;
  const fair = Math.round(resp.market?.fair_value ?? resp.market?.median_price ?? ask);

  // F1b — frais / net de la plateforme sélectionnée : on lit l'entrée resale correspondante
  // pour rester cohérent avec ce qui est affiché en §03a (revente).
  const selectedResale =
    resp.resale?.platforms?.[PLATFORM_TO_API[inputs.platform]];
  const feesPct =
    typeof selectedResale?.seller_fees_pct === "number"
      ? selectedResale.seller_fees_pct
      : PLATFORM_FEES_PCT[inputs.platform];
  const feesFrac = feesPct / 100;
  const fairNet =
    typeof selectedResale?.seller_net_price === "number"
      ? selectedResale.seller_net_price
      : fair * (1 - feesFrac);
  const net_margin_eur = Math.round(
    typeof selectedResale?.net_margin_eur === "number"
      ? selectedResale.net_margin_eur
      : typeof selectedResale?.margin_eur === "number"
        ? selectedResale.margin_eur
        : fairNet - ask,
  );

  const verdict = VERDICT_EN_TO_FR[resp.score.verdict] ?? "NÉGOCIER";
  const mod = resp.score.modifiers ?? {};
  const modifiers = {
    trend_14d: mod.trend ?? 0,
    liquidity_mod: mod.liquidity ?? 0,
    value_vs_new: mod.value_vs_new ?? 0,
  };

  // F1 — base SOLD en priorité (le positionnement doit être sur les ventes, pas l'asking).
  const distribution: PercentileDistribution =
    resp.market?.sold_distribution ??
    resp.market?.distribution ?? {
      p10: Math.round(fair * 0.85),
      p25: Math.round(fair * 0.93),
      p50: fair,
      p75: Math.round(fair * 1.08),
      p90: Math.round(fair * 1.18),
    };

  const liqScore = resp.liquidity?.score ?? 0;
  const delta30 = resp.trends?.trend_30d_pct ?? 0;
  const delta7 = resp.trends?.trend_7d_pct ?? 0;
  const decote = resp.market?.discount_vs_new_pct ?? 0;

  const category_market_stats: CategoryMarketStats = {
    trend: {
      delta_7d_pct: delta7,
      delta_30d_pct: delta30,
      status: trendStatus(delta30, resp.trends?.momentum),
      narrative: resp.trends?.interpretation ?? "Tendance marché récente.",
    },
    liquidity: {
      sales_30d: resp.liquidity?.sold_30d ?? 0,
      active_listings: resp.liquidity?.active_listings ?? 0,
      status: liquidityStatus(liqScore),
      narrative: resp.liquidity?.interpretation ?? "Liquidité du modèle.",
    },
    value_vs_new: {
      decote_pct: decote,
      status: valueVsNewStatus(decote),
      narrative:
        decote > 0
          ? `Décote de ${Math.abs(Math.round(decote))}% vs le neuf.`
          : "Pas de référence neuve fiable.",
    },
  };

  const baseScore = resp.score.base_score ?? resp.score.overall;
  const score_total = resp.score.overall;

  // F1 — Négociation : mappage direct de l'API. Pas de fabrication de probabilités.
  const neg = resp.negotiation ?? {};

  // Net indicatif = (resale best seller_net_price si dispo) - prix offert. Fallback : fairNet.
  let bestNetRef: number = fairNet;
  const resaleR = resp.resale;
  if (resaleR?.platforms) {
    const bestKey =
      (resaleR.best_platform && resaleR.platforms[resaleR.best_platform]) ||
      Object.values(resaleR.platforms).find((p) => p.is_recommended);
    const snp =
      typeof bestKey === "object" && bestKey
        ? bestKey.seller_net_price
        : undefined;
    if (typeof snp === "number") bestNetRef = snp;
  }

  const apiOffers = Array.isArray(neg.offers) ? neg.offers : [];
  const offers: NegotiationOffer[] = apiOffers
    .filter((o) => typeof o.price === "number")
    .map((o) => ({
      type: o.type ?? "offer",
      label: o.label ?? o.type ?? "Offre",
      price_eur: Math.round(o.price ?? 0),
      estimated_net_margin_eur: Math.round(bestNetRef - (o.price ?? 0)),
      likelihood: mapLikelihood(o.likelihood),
    }));

  const negotiation: NegotiationPlan = {
    offers,
    arguments: (neg.arguments ?? []).map((label) => ({
      category: argCategory(label),
      label,
      weight: "modéré" as const,
    })),
    keywords: NEGOTIATION_KEYWORDS,
    reflexes:
      neg.reflexes &&
      ((neg.reflexes.opportunity?.length ?? 0) > 0 ||
        (neg.reflexes.red_flag?.length ?? 0) > 0)
        ? {
            opportunity: neg.reflexes.opportunity ?? [],
            red_flag: neg.reflexes.red_flag ?? [],
          }
        : undefined,
    strategy_mode:
      typeof neg.strategy_mode === "string" &&
      VALID_STRATEGY_MODES.includes(neg.strategy_mode as StrategyMode)
        ? (neg.strategy_mode as StrategyMode)
        : undefined,
    strategy_narrative:
      neg.tip ?? "Proposez sous le prix affiché : la négociation est la norme.",
    seller_motivation: neg.seller_motivation,
  };

  return {
    inputs,
    model_name: resp.model?.name ?? inputs.model,
    category: API_CAT_TO_FRONT[resp.model?.category ?? ""] ?? "GPU",
    verdict,
    confidence_pct: Math.round((resp.score.confidence?.score ?? 0) * 100),
    fair_price_eur: fair,
    net_margin_eur,
    percentile_distribution: distribution,
    sold_histogram: resp.market?.sold_histogram ?? null,
    composite_score: {
      margin: Math.round(Math.max(0, Math.min(100, 50 + (ask > 0 ? (net_margin_eur / ask) * 100 : 0) * 2.5))),
      liquidity: Math.round(liqScore * 100),
      affinity: PLATFORM_AFFINITY[inputs.platform],
    },
    modifiers,
    platform_fees_pct: feesPct,
    evaluated_at: resp.created_at,

    price_history_30d: [],
    percentile_position_pct: resp.market?.percentile_rank ?? resp.score.percentile_rank ?? 50,
    category_market_stats,

    score_total,
    score_breakdown: {
      base: baseScore,
      trend: modifiers.trend_14d,
      liquidity: modifiers.liquidity_mod,
      value_vs_new: modifiers.value_vs_new,
      total_adjusted: Math.round(mod.total_adjusted ?? (score_total - baseScore)),
      total: score_total,
    },
    landmarks: {
      ceiling_buy_eur: Math.round(neg.max_price ?? ask),
      optimal_buy_eur: Math.round(neg.compromise_offer ?? ask * 0.91),
      floor_resale_eur: Math.round(
        typeof selectedResale?.seller_net_price === "number"
          ? selectedResale.seller_net_price
          : fairNet,
      ),
    },
    data_quality: parseDataQuality(resp.score.confidence?.factors),

    negotiation,
    has_market_detail: Boolean(
      resp.market?.sold_distribution ?? resp.market?.distribution,
    ),
    resale_where: mapResaleWhere(resp, ask),
    resale_when: mapResaleWhen(resp),
    warnings: Array.isArray(resp.warnings)
      ? resp.warnings.map((w) => ({
          code: w.code,
          severity: w.severity,
          message: w.message,
          headline: w.headline,
          delta_vs_market_pct: w.delta_vs_market_pct,
          scam_signals: Array.isArray(w.scam_signals) ? w.scam_signals : undefined,
          verification_steps: Array.isArray(w.verification_steps)
            ? w.verification_steps
            : undefined,
          recommended_action: w.recommended_action,
          action_rationale: w.action_rationale,
        }))
      : [],
    positioning_basis: resp.market?.positioning_basis,
  };
}

// ── Entrée publique ──────────────────────────────────────────────────────────

interface ApiHistoryPoint {
  price_median?: number | null;
}
interface ApiHistoryResponse {
  points?: ApiHistoryPoint[];
}

// Vraie série médiane SOLD 30 j (dé-lumpée : key=sale, sold pur). Tolérante : [] si indispo.
async function fetchSoldHistory(modelId: number): Promise<number[]> {
  try {
    const data = await apiFetch<ApiHistoryResponse>(
      `${ENDPOINTS.MARKET_HISTORY(modelId)}?days=30&bucket=day&key=sale&kind=sold`,
      { method: "GET" },
    );
    return (data.points ?? [])
      .map((p) => (typeof p.price_median === "number" ? Math.round(p.price_median) : null))
      .filter((v): v is number => v !== null);
  } catch {
    return [];
  }
}

export async function evaluate(
  inputs: EstimatorInputs,
): Promise<AnyEstimatorResult> {
  const modelId = await resolveModelId(inputs.model);
  const isSell = inputs.flow === "sell";

  if (isSell) {
    const body: Record<string, unknown> = {
      mode: "component",
      flow: "sell",
      model_id: modelId,
      platform: PLATFORM_TO_API[inputs.platform],
      condition: STATE_TO_CONDITION[inputs.state],
    };
    if (typeof inputs.acquisition_cost === "number") {
      body.acquisition_cost = inputs.acquisition_cost;
    }
    let resp: ApiEvaluateResponse;
    try {
      resp = await apiFetch<ApiEvaluateResponse>(ENDPOINTS.ESTIMATOR_EVALUATE, {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (err) {
      // Fallback : certains backends exigent encore `price`. Retente avec 0.
      if (err instanceof ApiException && err.status === 422) {
        resp = await apiFetch<ApiEvaluateResponse>(
          ENDPOINTS.ESTIMATOR_EVALUATE,
          {
            method: "POST",
            body: JSON.stringify({ ...body, price: 0 }),
          },
        );
      } else {
        throw err;
      }
    }
    return mapSellResponse(inputs, resp);
  }

  const body: Record<string, unknown> = {
    mode: "component",
    flow: "buy",
    model_id: modelId,
    price: inputs.ask_price_eur,
    platform: PLATFORM_TO_API[inputs.platform],
    condition: STATE_TO_CONDITION[inputs.state],
  };
  if (typeof inputs.listing_age_days === "number") {
    body.listing_age_days = inputs.listing_age_days;
  }
  const [resp, history] = await Promise.all([
    apiFetch<ApiEvaluateResponse>(ENDPOINTS.ESTIMATOR_EVALUATE, {
      method: "POST",
      body: JSON.stringify(body),
    }),
    fetchSoldHistory(modelId),
  ]);
  const result = mapResponse(inputs, resp);
  result.flow = "buy";
  result.price_history_30d = history;
  return result;
}

// ── F2a — Mapping SELL ───────────────────────────────────────────────────────

const SELL_TIERS: SellStrategyTier[] = ["rapide", "optimal", "patient"];

function mapSellStrategy(
  tier: SellStrategyTier,
  s: ApiSellStrategy | undefined,
): SellStrategy {
  return {
    tier,
    listing_price: Math.round(s?.listing_price ?? 0),
    net_price: Math.round(s?.net_price ?? 0),
    est_days: s?.est_days ?? 0,
    likelihood: mapLikelihood(s?.likelihood),
    profit_eur:
      typeof s?.profit_eur === "number" ? Math.round(s.profit_eur) : undefined,
    profit_pct:
      typeof s?.profit_pct === "number" ? Math.round(s.profit_pct) : undefined,
  };
}

function mapSellResponse(
  inputs: EstimatorInputs,
  resp: ApiEvaluateResponse,
): SellResult {
  const sold = resp.market?.sold_distribution;
  const median = Math.round(sold?.p50 ?? resp.market?.median_price ?? 0);

  const delta30 = resp.trends?.trend_30d_pct ?? 0;
  const trend_status = trendStatus(delta30, resp.trends?.momentum);
  const trend_narrative =
    resp.trends?.interpretation ?? "Tendance marché récente.";

  const strategies: SellStrategy[] = SELL_TIERS.map((t) =>
    mapSellStrategy(t, resp.strategies?.[t]),
  );
  const recommended =
    strategies.find((s) => s.tier === "optimal") ?? strategies[0];

  const reco = resp.platform_reco;
  const order = reco?.ranked_order ?? Object.keys(reco?.platforms ?? {});
  const platforms: SellPlatform[] = [];
  for (const key of order) {
    const p = reco?.platforms?.[key];
    const front = RESALE_API_TO_FRONT[key];
    if (!p || !front) continue;
    platforms.push({
      platform: front,
      seller_net_price: Math.round(p.seller_net_price ?? 0),
      fees_pct: p.seller_fees_pct ?? 0,
      net_margin_eur:
        typeof p.net_margin_eur === "number"
          ? Math.round(p.net_margin_eur)
          : undefined,
      est_sell_days: p.est_sell_days ?? 0,
      is_recommended: Boolean(p.is_recommended),
      data_confidence: p.data_confidence,
      narrative: p.tip ?? p.note ?? "",
    });
  }
  if (platforms.length && !platforms.some((p) => p.is_recommended)) {
    platforms[0].is_recommended = true;
  }
  const bestKey = reco?.best_platform ?? order[0] ?? "";
  const best_platform =
    RESALE_API_TO_FRONT[bestKey] ??
    platforms.find((p) => p.is_recommended)?.platform ??
    platforms[0]?.platform ??
    inputs.platform;

  const decay: DecayStep[] | undefined = Array.isArray(resp.decay_schedule)
    ? resp.decay_schedule
        .filter(
          (d) =>
            typeof d.day === "number" &&
            typeof d.price === "number" &&
            (d.strategy === "patient" ||
              d.strategy === "optimal" ||
              d.strategy === "rapide"),
        )
        .map((d) => ({
          day: d.day as number,
          strategy: d.strategy as DecayStep["strategy"],
          price: Math.round(d.price as number),
        }))
        .sort((a, b) => a.day - b.day)
    : undefined;

  const projection: SellProjection | undefined = resp.projection
    ? {
        timing: resp.projection.timing ?? "neutral",
        trend_30d_pct:
          typeof resp.projection.trend_30d_pct === "number"
            ? resp.projection.trend_30d_pct
            : null,
        projected_patient_value:
          typeof resp.projection.projected_patient_value === "number"
            ? Math.round(resp.projection.projected_patient_value)
            : null,
        narrative: resp.projection.narrative ?? "",
      }
    : undefined;

  const presentation: SellPresentation | undefined = resp.presentation
    ? {
        completeness: Array.isArray(resp.presentation.completeness)
          ? resp.presentation.completeness
          : [],
        terms_to_avoid: Array.isArray(resp.presentation.terms_to_avoid)
          ? resp.presentation.terms_to_avoid
          : [],
        terms_to_favor: Array.isArray(resp.presentation.terms_to_favor)
          ? resp.presentation.terms_to_favor
          : [],
        condition_framing: resp.presentation.condition_framing ?? "",
        category_tip: resp.presentation.category_tip,
      }
    : undefined;

  const pricing_basis: PricingBasis | undefined = resp.pricing_basis
    ? {
        data_source_tier: (resp.pricing_basis.data_source_tier ?? 1) as 1 | 2 | 3,
        data_confidence: resp.pricing_basis.data_confidence ?? "high",
      }
    : undefined;

  return {
    flow: "sell",
    inputs,
    model_name: resp.model?.name ?? inputs.model,
    category: API_CAT_TO_FRONT[resp.model?.category ?? ""] ?? "GPU",
    median_eur: median,
    trend_status,
    trend_narrative,
    acquisition_cost: inputs.acquisition_cost,
    recommended,
    strategies,
    platforms,
    best_platform,
    evaluated_at: resp.created_at,
    decay,
    projection,
    presentation,
    pricing_basis,
  };
}

// ── Historique serveur ───────────────────────────────────────────────────────

interface ApiHistoryItem {
  id: number;
  created_at: string;
  result_snapshot: ApiEvaluateResponse;
  input_snapshot?: { price?: number; condition?: string; platform?: string; region?: string } | null;
}

function reconstructInputs(item: ApiHistoryItem): EstimatorInputs {
  const r = item.result_snapshot;
  const inp = item.input_snapshot ?? (r as { input?: ApiHistoryItem["input_snapshot"] }).input ?? {};
  return {
    model: r.model?.name ?? "",
    state: CONDITION_TO_STATE[inp?.condition ?? ""] ?? "Bon",
    ask_price_eur: typeof inp?.price === "number" ? inp.price : 0,
    platform: API_PLATFORM_TO_FRONT[inp?.platform ?? ""] ?? "LBC",
    region_fr: inp?.region ?? undefined,
  };
}

export function mapHistoryItem(item: ApiHistoryItem): EstimatorHistoryEntry | null {
  try {
    const snapshot = item.result_snapshot;

    // On n'affiche que les évaluations ACHAT mappables. Les runs VENTE (flow=sell,
    // sans bloc `score`) et les snapshots legacy sans `score` sont ignorés — un
    // snapshot non mappable ne doit JAMAIS faire planter (et vider) tout le tiroir.
    const hasScore = Boolean(
      (snapshot as { score?: { verdict?: unknown } }).score?.verdict,
    );

    if (!hasScore || (snapshot as { flow?: string }).flow === "sell") return null;

    const inputs = reconstructInputs(item);
    const result = mapResponse(inputs, snapshot);

    return { id: String(item.id), ts: Date.parse(item.created_at), inputs, result };
  } catch {
    return null;
  }
}

export async function fetchEstimatorHistory(limit = 50): Promise<EstimatorHistoryEntry[]> {
  const data = await apiFetch<unknown>(`${ENDPOINTS.ESTIMATOR_HISTORY}?limit=${limit}&offset=0`, { method: "GET" });
  const d = data as Record<string, unknown>;
  const items = (Array.isArray(data) ? data : (d.items ?? d.runs ?? d.results ?? d.data ?? [])) as ApiHistoryItem[];
  return items
    .map(mapHistoryItem)
    .filter((e): e is EstimatorHistoryEntry => e !== null);
}

export async function deleteEstimatorRun(runId: string): Promise<void> {
  await apiFetch<void>(ENDPOINTS.ESTIMATOR_RUN(runId), { method: "DELETE" });
}

export async function clearEstimatorHistory(): Promise<void> {
  await apiFetch<void>(ENDPOINTS.ESTIMATOR_HISTORY, { method: "DELETE" });
}
