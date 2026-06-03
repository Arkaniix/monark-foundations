import Estimator, { type EstimatorState } from "./Estimator";
import type { EstimatorResult } from "@/components/estimator/datasets";

const SUCCESS_RESULT: EstimatorResult = {
  inputs: {
    model: "Ryzen 7 7800X3D",
    state: "Bon",
    ask_price_eur: 265,
    platform: "LBC",
  },
  model_name: "Ryzen 7 7800X3D",
  category: "CPU",
  verdict: "FONCER",
  confidence_pct: 87,
  fair_price_eur: 313,
  net_margin_eur: 10,
  percentile_distribution: { p10: 244, p25: 275, p50: 313, p75: 344, p90: 382 },
  composite_score: { margin: 56, liquidity: 78, affinity: 88 },
  modifiers: { trend_14d: 6, liquidity_mod: 3, value_vs_new: 2 },
  platform_fees_pct: 12,
  evaluated_at: new Date().toISOString(),

  price_history_30d: [
    298, 305, 295, 312, 308, 318, 320, 325, 322, 318, 315, 320, 315, 310, 312,
    318, 322, 320, 315, 308, 305, 310, 315, 312, 308, 305, 312, 318, 315, 313,
  ],
  percentile_position_pct: 22,
  category_market_stats: {
    trend: {
      delta_7d_pct: 2.4,
      delta_30d_pct: 5.1,
      status: "En hausse",
      narrative:
        "Marché CPU en hausse sur 30 j (+5.1 %). Acheter rapidement avant que les prix continuent de monter — bon timing.",
    },
    liquidity: {
      sales_30d: 412,
      active_listings: 38,
      status: "Élevée",
      narrative:
        "412 ventes / mois pour 38 annonces — rotation forte, revente rapide quasi assurée.",
    },
    value_vs_new: {
      decote_pct: -22,
      status: "Forte",
      narrative:
        "État Bon — 22 % sous le prix neuf marché. Décote cohérente avec l'usure, marge confortable côté revente.",
    },
  },

  // E3 §01 enrichi + §03
  score_total: 89,
  score_breakdown: {
    base: 78,
    trend: 6,
    liquidity: 3,
    value_vs_new: 2,
    total_adjusted: 11,
    total: 89,
  },
  landmarks: {
    ceiling_buy_eur: 344,
    optimal_buy_eur: 257,
    floor_resale_eur: 301,
  },
  data_quality: {
    observations_count: 412,
    fresh_within_hours: 48,
    platform_specific: true,
  },

  negotiation: {
    offers: [
      { type: "lowball", label: "Offre agressive", price_eur: 212, estimated_net_margin_eur: 63, likelihood: "faible" },
      { type: "negotiated", label: "Contre-offre", price_eur: 233, estimated_net_margin_eur: 42, likelihood: "modérée" },
      { type: "cordial", label: "Offre cordiale", price_eur: 252, estimated_net_margin_eur: 23, likelihood: "élevée" },
    ],
    arguments: [
      { category: "concurrence", label: "412 ventes / mois sur CPU — vendeur sous pression concurrence, argument volume solide.", weight: "fort" },
      { category: "état", label: "État Bon (-22 % vs neuf) — argument modéré, mentionne les traces d'usage usuelles.", weight: "modéré" },
      { category: "marché", label: "Marché CPU en hausse (+5.1 %) — peu d'argument prix, joue plutôt la rapidité.", weight: "faible" },
    ],
    keywords: {
      opportunity: ["urgent", "déménagement", "à débarrasser", "raisonnable", "à discuter", "petit prix", "vite", "négociable"],
      red_flag: ["en l'état", "pour pièces", "no return", "non testé", "ne fonctionne plus", "sans garantie"],
    },
    strategy_narrative: "Deal excellent même au prix demandé. Pour optimiser : ouvre à 212 €, replie sur 233 €. Si refus net, prends à 252 € sans hésiter.",
  },
  resale_where: {
    cost_basis_eur: 265,
    platforms: [
      { platform: "LBC", estimated_price_eur: 313, fees_pct: 12, net_margin_eur: 10, expected_delay_days: 9, recommendation_score: 79, is_top_pick: true, narrative: "Audience locale française forte, délai court, frais modérés. Le standard pour le hardware d'occasion." },
      { platform: "eBay", estimated_price_eur: 329, fees_pct: 18, net_margin_eur: 5, expected_delay_days: 15, recommendation_score: 68, is_top_pick: false, narrative: "Audience internationale, prix légèrement plus haut acceptés. Frais 18 % et concurrence forte." },
      { platform: "Vinted", estimated_price_eur: 288, fees_pct: 5, net_margin_eur: 9, expected_delay_days: 22, recommendation_score: 41, is_top_pick: false, narrative: "Audience principalement textile — hardware peu performant, délais longs." },
    ],
    top_pick_narrative: "LBC sort en tête sur ce hardware liquide : marge confortable (+10 €) et délai court (~9 j). Audience locale française forte, délai court, frais modérés. Le standard pour le hardware d'occasion.",
  },
  resale_when: {
    by_platform: {
      LBC: [
        { timing: "RAPIDE", expected_price_eur: 266, expected_delay_days: 3, likelihood: "élevée", net_margin_eur: -31, is_top_pick: false, narrative: "Vente quasi-immédiate sur LBC. Prix accessible, on rogne sur la marge pour libérer le cash rapidement." },
        { timing: "OPTIMAL", expected_price_eur: 313, expected_delay_days: 9, likelihood: "élevée", net_margin_eur: 10, is_top_pick: true, narrative: "Meilleur compromis marge × délai sur LBC. Le sweet spot par défaut." },
        { timing: "PATIENT", expected_price_eur: 354, expected_delay_days: 25, likelihood: "modérée", net_margin_eur: 46, is_top_pick: false, narrative: "Maximiser le prix au prix d'un délai long sur LBC. Pour qui peut attendre." },
      ],
      eBay: [
        { timing: "RAPIDE", expected_price_eur: 280, expected_delay_days: 5, likelihood: "élevée", net_margin_eur: -35, is_top_pick: false, narrative: "Vente quasi-immédiate sur eBay. Prix accessible, on rogne sur la marge pour libérer le cash rapidement." },
        { timing: "OPTIMAL", expected_price_eur: 329, expected_delay_days: 15, likelihood: "élevée", net_margin_eur: 5, is_top_pick: true, narrative: "Meilleur compromis marge × délai sur eBay. Le sweet spot par défaut." },
        { timing: "PATIENT", expected_price_eur: 372, expected_delay_days: 42, likelihood: "modérée", net_margin_eur: 40, is_top_pick: false, narrative: "Maximiser le prix au prix d'un délai long sur eBay. Pour qui peut attendre." },
      ],
      Vinted: [
        { timing: "RAPIDE", expected_price_eur: 245, expected_delay_days: 7, likelihood: "élevée", net_margin_eur: -32, is_top_pick: false, narrative: "Vente quasi-immédiate sur Vinted. Prix accessible, on rogne sur la marge pour libérer le cash rapidement." },
        { timing: "OPTIMAL", expected_price_eur: 288, expected_delay_days: 22, likelihood: "élevée", net_margin_eur: 9, is_top_pick: true, narrative: "Meilleur compromis marge × délai sur Vinted. Le sweet spot par défaut." },
        { timing: "PATIENT", expected_price_eur: 326, expected_delay_days: 62, likelihood: "modérée", net_margin_eur: 45, is_top_pick: false, narrative: "Maximiser le prix au prix d'un délai long sur Vinted. Pour qui peut attendre." },
      ],
    },
  },
};

const STATES: { label: string; state: EstimatorState }[] = [
  { label: "idle", state: { status: "idle" } },
  {
    label: "evaluating",
    state: { status: "evaluating", inputs: SUCCESS_RESULT.inputs },
  },
  { label: "success", state: { status: "success", result: SUCCESS_RESULT } },
  {
    label: "error",
    state: {
      status: "error",
      message: "Estimator evaluate endpoint not yet wired to backend.",
      lastInputs: SUCCESS_RESULT.inputs,
    },
  },
];

export default function EstimatorStatesPreview() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100">
      <div className="mx-auto px-6 py-8" style={{ maxWidth: 1320 }}>
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500 mb-6">
          /_DEV/ESTIMATOR-STATES — PREVIEW DES 4 ÉTATS
        </div>
        <div className="flex flex-col gap-12">
          {STATES.map(({ label, state }) => (
            <div key={label}>
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-600 mb-3">
                ▸ ÉTAT : {label.toUpperCase()}
              </div>
              <Estimator __devForceState={state} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
