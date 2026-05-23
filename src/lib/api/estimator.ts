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
  RESALE_TIMINGS,
} from "../../components/estimator/datasets";
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
  CategoryMarketStats,
  TrendStatus,
  LiquidityStatus,
  ValueVsNewStatus,
  PlatformResaleStats,
  ResaleWhereRecommendation,
  ResaleWhenOption,
  ResaleWhenRecommendation,
  DataQuality,
} from "../../components/estimator/datasets";

// ── Maps front → API ────────────────────────────────────────────────────────

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

const VERDICT_EN_TO_FR: Record<string, Verdict> = {
  BUY: "FONCER",
  NEGOTIATE: "NÉGOCIER",
  LOWBALL: "TENTER",
  AVOID: "PASSER",
};

const API_CAT_TO_FRONT: Record<string, HardwareCategory> = {
  GPU: "GPU",
  CPU: "CPU",
  RAM: "RAM",
  SSD: "SSD",
  MOTHERBOARD: "MOBO",
  PSU: "PSU",
};

// Probabilités d'acceptation par palier, modulées par le verdict (synthétique).
const ACCEPT_BY_VERDICT: Record<Verdict, { lowball: number; negotiated: number; cordial: number }> = {
  FONCER: { lowball: 55, negotiated: 75, cordial: 90 },
  "NÉGOCIER": { lowball: 40, negotiated: 65, cordial: 85 },
  TENTER: { lowball: 25, negotiated: 45, cordial: 70 },
  PASSER: { lowball: 15, negotiated: 30, cordial: 55 },
};

const PLATFORM_AFFINITY: Record<Platform, number> = { LBC: 85, Vinted: 60, eBay: 75 };
const PLATFORM_RESALE_FACTOR: Record<Platform, number> = { LBC: 0.94, Vinted: 0.97, eBay: 1.08 };
const PLATFORM_DELAY_DAYS: Record<Platform, number> = { LBC: 7, Vinted: 10, eBay: 5 };

// ── Forme (partielle) de POST /v1/estimator/evaluate (mode component) ───────
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
    modifiers?: { trend?: number; liquidity?: number; value_vs_new?: number };
  };
  market?: {
    median_price?: number;
    fair_value?: number | null;
    percentile_rank?: number;
    distribution?: PercentileDistribution | null;
    new_price?: number | null;
    discount_vs_new_pct?: number | null;
  };
  trends?: { trend_7d_pct?: number; trend_30d_pct?: number; momentum?: string; interpretation?: string };
  liquidity?: { score?: number; sold_30d?: number; active_listings?: number; interpretation?: string };
  negotiation?: {
    aggressive_offer?: number;
    compromise_offer?: number;
    max_price?: number;
    savings_aggressive_eur?: number;
    savings_compromise_eur?: number;
    arguments?: string[];
    tip?: string;
  };
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

function generatePriceHistory(median: number, delta30Pct: number, seed: number): number[] {
  const n = 30;
  const drift = (median * delta30Pct) / 100 / n;
  const noise = median * 0.02;
  const out: number[] = [];
  let cur = median * (1 - delta30Pct / 100);
  for (let i = 0; i < n; i++) {
    out.push(Math.round(cur + Math.sin(seed * 7.1 + i * 0.9) * noise));
    cur += drift;
  }
  return out;
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

// ── Dérivation revente ───────────────────────────────────────────────────────

function buildResaleWhere(costBasis: number, fair: number): ResaleWhereRecommendation {
  const platforms: PlatformResaleStats[] = PLATFORMS.map((p) => {
    const estimated = Math.round(fair * PLATFORM_RESALE_FACTOR[p]);
    const fees_pct = PLATFORM_FEES_PCT[p];
    const net = Math.round(estimated * (1 - fees_pct / 100) - costBasis);
    const score = Math.max(0, Math.min(100, 50 + (net / Math.max(1, costBasis)) * 100));
    return {
      platform: p,
      estimated_price_eur: estimated,
      fees_pct,
      net_margin_eur: net,
      expected_delay_days: PLATFORM_DELAY_DAYS[p],
      recommendation_score: Math.round(score),
      is_top_pick: false,
      narrative: `Revente estimée ${estimated} € sur ${p}, ${fees_pct}% de frais, marge nette ~${net} €.`,
    };
  });
  let topIdx = 0;
  platforms.forEach((pl, i) => {
    if (pl.net_margin_eur > platforms[topIdx].net_margin_eur) topIdx = i;
  });
  platforms[topIdx].is_top_pick = true;
  return {
    cost_basis_eur: Math.round(costBasis),
    platforms,
    top_pick_narrative: `${platforms[topIdx].platform} maximise la marge nette (~${platforms[topIdx].net_margin_eur} €) pour ce modèle.`,
  };
}

function buildResaleWhen(costBasis: number, fair: number, verdict: Verdict): ResaleWhenRecommendation {
  const TIMING_PRICE: Record<string, number> = { RAPIDE: 0.93, OPTIMAL: 1.0, PATIENT: 1.06 };
  const TIMING_DELAY: Record<string, number> = { RAPIDE: 0.6, OPTIMAL: 1.0, PATIENT: 1.9 };
  const accept = ACCEPT_BY_VERDICT[verdict];
  const TIMING_ACCEPT: Record<string, number> = {
    RAPIDE: accept.cordial,
    OPTIMAL: accept.negotiated,
    PATIENT: accept.lowball,
  };
  const by_platform = {} as Record<Platform, ResaleWhenOption[]>;
  for (const p of PLATFORMS) {
    const base = fair * PLATFORM_RESALE_FACTOR[p];
    const options: ResaleWhenOption[] = RESALE_TIMINGS.map((t) => {
      const price = Math.round(base * TIMING_PRICE[t]);
      const net = Math.round(price * (1 - PLATFORM_FEES_PCT[p] / 100) - costBasis);
      return {
        timing: t,
        expected_price_eur: price,
        expected_delay_days: Math.round(PLATFORM_DELAY_DAYS[p] * TIMING_DELAY[t]),
        acceptance_probability_pct: TIMING_ACCEPT[t],
        net_margin_eur: net,
        is_top_pick: t === "OPTIMAL",
        narrative:
          t === "RAPIDE"
            ? "Vente rapide, prix bas mais liquidité immédiate."
            : t === "OPTIMAL"
              ? "Meilleur compromis prix / délai."
              : "Prix maximal au prix d'un délai plus long.",
      };
    });
    by_platform[p] = options;
  }
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
  const feesPct = PLATFORM_FEES_PCT[inputs.platform];
  const feesFrac = feesPct / 100;

  const fair = Math.round(resp.market?.fair_value ?? resp.market?.median_price ?? ask);
  const fairNet = fair * (1 - feesFrac);
  const net_margin_eur = Math.round(fairNet - ask);

  const verdict = VERDICT_EN_TO_FR[resp.score.verdict] ?? "NÉGOCIER";
  const mod = resp.score.modifiers ?? {};
  const modifiers = {
    trend_14d: mod.trend ?? 0,
    liquidity_mod: mod.liquidity ?? 0,
    value_vs_new: mod.value_vs_new ?? 0,
  };

  const distribution: PercentileDistribution = resp.market?.distribution ?? {
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

  // Négociation : chiffres réels si présents, sinon dérivés.
  const neg = resp.negotiation ?? {};
  const aggressive = neg.aggressive_offer ?? Math.round(ask * 0.82);
  const compromise = neg.compromise_offer ?? Math.round(ask * 0.91);
  const cordial = Math.min(ask, neg.max_price ?? Math.round(ask * 0.97));
  const accept = ACCEPT_BY_VERDICT[verdict];

  const mkOffer = (
    tier: NegotiationOffer["tier"],
    label: string,
    amount: number,
    prob: number,
  ): NegotiationOffer => ({
    tier,
    label,
    amount_eur: Math.round(amount),
    pct_of_ask: ask > 0 ? Math.round((amount / ask) * 100) : 0,
    savings_eur: Math.round(ask - amount),
    estimated_net_margin_eur: Math.round(fairNet - amount),
    acceptance_probability_pct: prob,
  });

  const negotiation: NegotiationPlan = {
    offers: [
      mkOffer("lowball", "Tenter au culot", aggressive, accept.lowball),
      mkOffer("negotiated", "Négocier", compromise, accept.negotiated),
      mkOffer("cordial", "Offre cordiale", cordial, accept.cordial),
    ],
    arguments: (neg.arguments ?? []).map((label) => ({
      category: argCategory(label),
      label,
      weight: "modéré" as const,
    })),
    keywords: NEGOTIATION_KEYWORDS,
    strategy_narrative: neg.tip ?? "Proposez sous le prix affiché : la négociation est la norme.",
  };

  const costBasis = compromise; // base de revente = prix d'achat négocié réaliste
  const seed = resp.model?.id ?? Math.round(fair);

  return {
    inputs,
    model_name: resp.model?.name ?? inputs.model,
    category: API_CAT_TO_FRONT[resp.model?.category ?? ""] ?? "GPU",
    verdict,
    confidence_pct: Math.round((resp.score.confidence?.score ?? 0) * 100),
    fair_price_eur: fair,
    net_margin_eur,
    percentile_distribution: distribution,
    composite_score: {
      margin: Math.round(Math.max(0, Math.min(100, 50 + (ask > 0 ? (net_margin_eur / ask) * 100 : 0) * 2.5))),
      liquidity: Math.round(liqScore * 100),
      affinity: PLATFORM_AFFINITY[inputs.platform],
    },
    modifiers,
    platform_fees_pct: feesPct,
    evaluated_at: resp.created_at,

    price_history_30d: generatePriceHistory(fair, delta30, seed),
    percentile_position_pct: resp.market?.percentile_rank ?? resp.score.percentile_rank ?? 50,
    category_market_stats,

    score_total,
    score_breakdown: {
      base: baseScore,
      trend: modifiers.trend_14d,
      liquidity: modifiers.liquidity_mod,
      value_vs_new: modifiers.value_vs_new,
      total: score_total,
    },
    landmarks: {
      ceiling_buy_eur: Math.round(neg.max_price ?? ask),
      optimal_buy_eur: Math.round(compromise),
      floor_resale_eur: Math.round(fairNet),
    },
    data_quality: parseDataQuality(resp.score.confidence?.factors),

    negotiation,
    resale_where: buildResaleWhere(costBasis, fair),
    resale_when: buildResaleWhen(costBasis, fair, verdict),
  };
}

// ── Entrée publique ──────────────────────────────────────────────────────────

export async function evaluate(inputs: EstimatorInputs): Promise<EstimatorResult> {
  const modelId = await resolveModelId(inputs.model);
  const body = {
    mode: "component",
    model_id: modelId,
    price: inputs.ask_price_eur,
    platform: PLATFORM_TO_API[inputs.platform],
    condition: STATE_TO_CONDITION[inputs.state],
    level: "complete",
  };
  const resp = await apiFetch<ApiEvaluateResponse>(ENDPOINTS.ESTIMATOR_EVALUATE, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapResponse(inputs, resp);
}
