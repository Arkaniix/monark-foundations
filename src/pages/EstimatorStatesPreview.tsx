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
};

const STATES: { label: string; state: EstimatorState }[] = [
  { label: "idle", state: { status: "idle" } },
  {
    label: "evaluating",
    state: { status: "evaluating", inputs: SUCCESS_RESULT.inputs },
  },
  {
    label: "success",
    state: { status: "success", result: SUCCESS_RESULT },
  },
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
    <div className="min-h-screen bg-[#0A0A0B] p-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
        <h1 className="font-mono text-[12px] tracking-[0.2em] text-zinc-400">
          /_DEV/ESTIMATOR-STATES — PREVIEW DES 4 ÉTATS
        </h1>

        <div className="flex flex-col gap-12">
          {STATES.map(({ label, state }) => (
            <div key={label} className="flex flex-col gap-4">
              <div className="font-mono text-[11px] tracking-[0.2em] text-zinc-500">
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