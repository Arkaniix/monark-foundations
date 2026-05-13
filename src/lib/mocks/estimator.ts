/**
 * Mock Estimator API — étendu E4 (négociation).
 */

import { mockDelay } from "./fixtures";
import {
  HARDWARE_CATALOG,
  NEGOTIATION_KEYWORDS,
  PLATFORM_FEES_PCT,
  type ArgumentWeight,
  type CategoryMarketStats,
  type EstimatorInputs,
  type EstimatorResult,
  type HardwareCategory,
  type ItemState,
  type LiquidityStatus,
  type NegotiationArgument,
  type NegotiationOffer,
  type NegotiationPlan,
  type PercentileDistribution,
  type Platform,
  type TrendStatus,
  type ValueVsNewStatus,
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

const STATE_DECOTE_PCT: Record<ItemState, number> = {
  Neuf: -5,
  "Comme neuf": -13,
  Bon: -22,
  Acceptable: -32,
  "Pour pièces": -58,
};

function lookupModel(name: string): { category: HardwareCategory; base: number } {
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

function computePercentilePosition(askPrice: number, dist: PercentileDistribution): number {
  const { p10, p25, p50, p75, p90 } = dist;
  const pts: [number, number][] = [[p10, 10], [p25, 25], [p50, 50], [p75, 75], [p90, 90]];
  if (askPrice <= p10) return 5;
  if (askPrice >= p90) return 95;
  for (let i = 0; i < pts.length - 1; i++) {
    const [v1, r1] = pts[i];
    const [v2, r2] = pts[i + 1];
    if (askPrice >= v1 && askPrice <= v2) {
      return Math.round(r1 + ((askPrice - v1) / (v2 - v1)) * (r2 - r1));
    }
  }
  return 50;
}

function generatePriceHistory(p50Today: number, delta30dPct: number, n = 30): number[] {
  const startPrice = p50Today / (1 + delta30dPct / 100);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const trend = startPrice + (p50Today - startPrice) * t;
    const noise = (Math.random() - 0.5) * 2 * p50Today * 0.04;
    out.push(Math.round(trend + noise));
  }
  return out;
}

function buildTrendStatus(d: number): TrendStatus { return d > 2 ? "En hausse" : d < -2 ? "En baisse" : "Stable"; }
function buildLiquidityStatus(l: number): LiquidityStatus { return l >= 75 ? "Élevée" : l >= 50 ? "Modérée" : "Faible"; }
function buildValueVsNewStatus(d: number): ValueVsNewStatus { const a = Math.abs(d); return a >= 20 ? "Forte" : a >= 10 ? "Modérée" : "Faible"; }

function buildTrendNarrative(s: TrendStatus, d: number, c: HardwareCategory): string {
  const a = Math.abs(d).toFixed(1);
  if (s === "En hausse") return `Marché ${c} en hausse sur 30 j (+${a} %). Acheter rapidement avant que les prix continuent de monter — bon timing.`;
  if (s === "En baisse") return `Marché ${c} en baisse sur 30 j (-${a} %). Argument de négo fort : le vendeur sait que ça baisse.`;
  return `Marché ${c} stable sur 30 j (±${a} %). Pas d'urgence, pas d'opportunité particulière côté tendance.`;
}

function buildLiquidityNarrative(s: LiquidityStatus, sales: number, listings: number): string {
  if (s === "Élevée") return `${sales} ventes / mois pour ${listings} annonces — rotation forte, revente rapide quasi assurée.`;
  if (s === "Modérée") return `${sales} ventes / mois pour ${listings} annonces — demande correcte, prévoir quelques jours pour revendre.`;
  return `${sales} ventes / mois pour ${listings} annonces — marché lent, anticipe une revente sur plusieurs semaines.`;
}

function buildValueVsNewNarrative(s: ValueVsNewStatus, d: number, st: ItemState): string {
  const a = Math.abs(d).toFixed(0);
  if (s === "Forte") return `État ${st} — ${a} % sous le prix neuf marché. Décote cohérente avec l'usure, marge confortable côté revente.`;
  if (s === "Modérée") return `État ${st} — ${a} % sous le prix neuf marché. Décote correcte, attention aux frais et imprévus.`;
  return `État ${st} — seulement ${a} % sous le prix neuf marché. Décote faible, marge serrée côté revente.`;
}

function buildCategoryMarketStats(category: HardwareCategory, trend14d: number, compositeLiq: number, state: ItemState): CategoryMarketStats {
  const delta30 = parseFloat((trend14d * 1.5 + (Math.random() - 0.5) * 2).toFixed(1));
  const delta7 = parseFloat((delta30 * 0.4 + (Math.random() - 0.5) * 1.5).toFixed(1));
  const trendStatus = buildTrendStatus(delta30);
  const sales30d = Math.round(compositeLiq * 5 + (Math.random() - 0.5) * 30);
  const activeListings = Math.round(sales30d / 12 + 15 + (Math.random() - 0.5) * 8);
  const liquidityStatus = buildLiquidityStatus(compositeLiq);
  const baseDecote = STATE_DECOTE_PCT[state];
  const decote = parseFloat((baseDecote + (Math.random() - 0.5) * 4).toFixed(1));
  const valueVsNewStatus = buildValueVsNewStatus(decote);
  const finalSales = Math.max(20, sales30d);
  const finalListings = Math.max(8, activeListings);
  return {
    trend: { delta_7d_pct: delta7, delta_30d_pct: delta30, status: trendStatus, narrative: buildTrendNarrative(trendStatus, delta30, category) },
    liquidity: { sales_30d: finalSales, active_listings: finalListings, status: liquidityStatus, narrative: buildLiquidityNarrative(liquidityStatus, finalSales, finalListings) },
    value_vs_new: { decote_pct: decote, status: valueVsNewStatus, narrative: buildValueVsNewNarrative(valueVsNewStatus, decote, state) },
  };
}

const ACCEPTANCE_BY_VERDICT: Record<Verdict, { lowball: number; negotiated: number; cordial: number }> = {
  FONCER: { lowball: 30, negotiated: 60, cordial: 82 },
  "NÉGOCIER": { lowball: 22, negotiated: 52, cordial: 78 },
  TENTER: { lowball: 14, negotiated: 38, cordial: 68 },
  PASSER: { lowball: 8, negotiated: 25, cordial: 55 },
};

function buildOffers(askPrice: number, fairPrice: number, optimalBuy: number, feesFrac: number, verdict: Verdict): NegotiationOffer[] {
  const lowballRaw = Math.min(optimalBuy, Math.round(askPrice * 0.8));
  const negotiatedRaw = Math.max(lowballRaw + 10, Math.round(askPrice * 0.88));
  const cordialRaw = Math.round(askPrice * 0.95);
  const lowball = Math.min(lowballRaw, askPrice - 1);
  const negotiated = Math.min(negotiatedRaw, askPrice - 1);
  const cordial = Math.min(cordialRaw, askPrice - 1);
  const acc = ACCEPTANCE_BY_VERDICT[verdict];
  const make = (tier: "lowball" | "negotiated" | "cordial", amount: number, label: string, p: number): NegotiationOffer => ({
    tier, label, amount_eur: amount,
    pct_of_ask: Math.round((amount / askPrice) * 100),
    savings_eur: askPrice - amount,
    estimated_net_margin_eur: Math.round(fairPrice * (1 - feesFrac) - amount),
    acceptance_probability_pct: p,
  });
  return [
    make("lowball", lowball, "Offre agressive", acc.lowball),
    make("negotiated", negotiated, "Contre-offre", acc.negotiated),
    make("cordial", cordial, "Offre cordiale", acc.cordial),
  ];
}

function buildArguments(marketStats: CategoryMarketStats, state: ItemState, percentilePosition: number, distribution: PercentileDistribution, category: HardwareCategory): NegotiationArgument[] {
  const args: NegotiationArgument[] = [];
  const delta30 = marketStats.trend.delta_30d_pct;
  if (delta30 <= -3) args.push({ category: "marché", label: `Marché ${category} en baisse de ${Math.abs(delta30).toFixed(1)} % sur 30 j — argument prix solide, le vendeur sait que ça baisse.`, weight: "fort" });
  else if (delta30 < -1) args.push({ category: "marché", label: `Marché ${category} légèrement en baisse (${delta30.toFixed(1)} %) — mentionne-le pour ouvrir la négo.`, weight: "modéré" });
  else if (delta30 >= 3) args.push({ category: "marché", label: `Marché ${category} en hausse (+${delta30.toFixed(1)} %) — peu d'argument prix, joue plutôt la rapidité.`, weight: "faible" });
  else args.push({ category: "marché", label: `Marché ${category} stable — pas d'argument tendance, oriente la négo sur l'état ou le timing.`, weight: "faible" });

  const decoteVsNew = Math.abs(marketStats.value_vs_new.decote_pct);
  if (state === "Pour pièces" || state === "Acceptable") args.push({ category: "état", label: `État ${state} (-${decoteVsNew.toFixed(0)} % vs neuf) — décote justifiée, base ta négo sur l'usure et les imperfections visibles.`, weight: "fort" });
  else if (state === "Bon") args.push({ category: "état", label: `État ${state} (-${decoteVsNew.toFixed(0)} % vs neuf) — argument modéré, mentionne les traces d'usage usuelles.`, weight: "modéré" });
  else args.push({ category: "état", label: `État ${state} — peu d'argument sur l'usure, oriente sur la concurrence ou le marché.`, weight: "faible" });

  const liqStatus = marketStats.liquidity.status;
  const sales = marketStats.liquidity.sales_30d;
  if (liqStatus === "Élevée") args.push({ category: "concurrence", label: `${sales} ventes / mois sur ${category} — vendeur sous pression concurrence, argument volume solide.`, weight: "fort" });
  else if (liqStatus === "Modérée") args.push({ category: "concurrence", label: `${sales} ventes / mois — marché correct mais pas saturé, argument concurrence modéré.`, weight: "modéré" });
  else args.push({ category: "concurrence", label: `Seulement ${sales} ventes / mois — peu d'alternatives, le vendeur peut tenir son prix.`, weight: "faible" });

  if (percentilePosition >= 60) args.push({ category: "position", label: `Prix au-dessus de la médiane (P${percentilePosition}) — pointe directement vers P25 (${distribution.p25} €) comme référence.`, weight: "fort" });
  else if (percentilePosition <= 25) args.push({ category: "position", label: `Ton prix est déjà bien placé (P${percentilePosition}) — reste léger sur la négo, ne vexe pas le vendeur.`, weight: "faible" });
  else args.push({ category: "position", label: `Position prix moyenne (P${percentilePosition}) — espace de négo modéré, vise P25 (${distribution.p25} €).`, weight: "modéré" });

  const rank: Record<ArgumentWeight, number> = { fort: 0, "modéré": 1, faible: 2 };
  args.sort((a, b) => rank[a.weight] - rank[b.weight]);
  return args.slice(0, 3);
}

function buildStrategyNarrative(offers: NegotiationOffer[], verdict: Verdict): string {
  const [lowball, negotiated, cordial] = offers;
  if (verdict === "PASSER") return `Marché défavorable. Si tu insistes : commence par ${lowball.amount_eur} € (sans excès d'espoir), monte au max à ${negotiated.amount_eur} €. Au-delà, mieux vaut chercher une autre annonce.`;
  if (verdict === "TENTER") return `Coût d'asking = zéro. Ouvre à ${lowball.amount_eur} €, replie sur ${negotiated.amount_eur} € si refusé. Plafond ${cordial.amount_eur} € — n'achète pas plus haut.`;
  if (verdict === "FONCER") return `Deal excellent même au prix demandé. Pour optimiser : ouvre à ${lowball.amount_eur} €, replie sur ${negotiated.amount_eur} €. Si refus net, prends à ${cordial.amount_eur} € sans hésiter.`;
  return `Ouvre à ${lowball.amount_eur} €, replie sur ${negotiated.amount_eur} € si refusé. ${cordial.amount_eur} € reste acceptable comme plafond.`;
}

function buildNegotiationPlan(askPrice: number, fairPrice: number, optimalBuy: number, feesFrac: number, verdict: Verdict, marketStats: CategoryMarketStats, state: ItemState, percentilePosition: number, distribution: PercentileDistribution, category: HardwareCategory): NegotiationPlan {
  const offers = buildOffers(askPrice, fairPrice, optimalBuy, feesFrac, verdict);
  return {
    offers,
    arguments: buildArguments(marketStats, state, percentilePosition, distribution, category),
    keywords: { opportunity: NEGOTIATION_KEYWORDS.opportunity, red_flag: NEGOTIATION_KEYWORDS.red_flag },
    strategy_narrative: buildStrategyNarrative(offers, verdict),
  };
}

export async function evaluate(inputs: EstimatorInputs): Promise<EstimatorResult> {
  await mockDelay(380);

  const { model, state, ask_price_eur, platform } = inputs;
  const { category, base } = lookupModel(model);

  const stateMult = STATE_MULTIPLIERS[state];
  const fair = Math.round(base * stateMult);
  const ratio = ask_price_eur / fair;
  const feesFrac = PLATFORM_FEES_PCT[platform] / 100;
  const netMargin = Math.round(fair * (1 - feesFrac) - ask_price_eur);

  const baseLiq = PLATFORM_LIQUIDITY[platform];
  const liq = Math.max(0.3, Math.min(0.95, baseLiq + (ratio < 0.9 ? 0.06 : 0) - (ratio > 1.1 ? 0.08 : 0)));

  const verdict = computeVerdict(ratio);
  const confidence = Math.round(70 + (1 - Math.min(1, Math.abs(ratio - 1))) * 25);

  const p10 = Math.round(fair * 0.78);
  const p25 = Math.round(fair * 0.88);
  const p50 = fair;
  const p75 = Math.round(fair * 1.1);
  const p90 = Math.round(fair * 1.22);

  const trend = ratio < 0.95 ? 6 : ratio > 1.05 ? -4 : 2;
  const liqMod = liq > 0.7 ? 3 : liq > 0.55 ? 1 : -2;
  const valueVsNew = state === "Neuf" ? -3 : state === "Comme neuf" ? -1 : state === "Bon" ? 2 : 4;

  const compositeLiquidity = Math.round(liq * 100);
  const distribution: PercentileDistribution = { p10, p25, p50, p75, p90 };
  const percentilePosition = computePercentilePosition(ask_price_eur, distribution);
  const categoryMarketStats = buildCategoryMarketStats(category, trend, compositeLiquidity, state);
  const priceHistory = generatePriceHistory(p50, categoryMarketStats.trend.delta_30d_pct);
  const observations = Math.max(80, Math.round(compositeLiquidity * 5 + Math.random() * 50));

  const baseScore = Math.round(100 - percentilePosition);
  const totalScore = Math.max(5, Math.min(95, baseScore + trend + liqMod + valueVsNew));

  const ceilingBuy = Math.round(fair * 1.1);
  const optimalBuy = Math.round(fair * 0.82);
  const floorResale = feesFrac > 0 && feesFrac < 1 ? Math.round(ask_price_eur / (1 - feesFrac)) : ask_price_eur;

  const negotiation = buildNegotiationPlan(ask_price_eur, fair, optimalBuy, feesFrac, verdict, categoryMarketStats, state, percentilePosition, distribution, category);

  return {
    inputs,
    model_name: model,
    category,
    verdict,
    confidence_pct: confidence,
    fair_price_eur: fair,
    net_margin_eur: netMargin,
    percentile_distribution: distribution,
    composite_score: {
      margin: Math.max(5, Math.min(95, 50 + (netMargin / fair) * 200)),
      liquidity: compositeLiquidity,
      affinity: PLATFORM_AFFINITY[platform],
    },
    modifiers: { trend_14d: trend, liquidity_mod: liqMod, value_vs_new: valueVsNew },
    platform_fees_pct: PLATFORM_FEES_PCT[platform],
    evaluated_at: new Date().toISOString(),
    price_history_30d: priceHistory,
    percentile_position_pct: percentilePosition,
    category_market_stats: categoryMarketStats,
    score_total: totalScore,
    score_breakdown: { base: baseScore, trend, liquidity: liqMod, value_vs_new: valueVsNew, total: totalScore },
    landmarks: { ceiling_buy_eur: ceilingBuy, optimal_buy_eur: optimalBuy, floor_resale_eur: floorResale },
    data_quality: { observations_count: observations, fresh_within_hours: 48, platform_specific: true },
    negotiation,
  };
}
