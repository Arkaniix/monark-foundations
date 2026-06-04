import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { DecayStep, SellResult } from "./datasets";

const TIER_LABEL: Record<DecayStep["strategy"], string> = {
  patient: "Patient",
  optimal: "Optimal",
  rapide: "Rapide",
};

const TIER_COLOR: Record<DecayStep["strategy"], string> = {
  patient: "#10B981",
  optimal: "#F59E0B",
  rapide: "#EF4444",
};

type Props = { result: SellResult };

export default function EstimatorSellDecay({ result }: Props) {
  const decay = result.decay;
  if (!decay || decay.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 05
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          CALENDRIER DE DÉCOTE
        </div>
      </div>

      <div className="mk-card p-6 flex flex-col gap-5">
        <p className="text-[13px] text-zinc-400 leading-relaxed">
          Si l'annonce ne part pas, baisse le prix par paliers :
        </p>

        <ol className="flex flex-col gap-3">
          {decay.map((step, i) => {
            const color = TIER_COLOR[step.strategy];
            const isStart = step.day === 0 || i === 0;
            return (
              <li
                key={`${step.day}-${step.strategy}`}
                className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.015] p-4"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: color,
                    boxShadow: `0 0 8px ${color}55`,
                  }}
                  aria-hidden="true"
                />
                <div className="flex-1 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[11px] tracking-[0.15em] text-zinc-400">
                      JOUR {step.day}
                    </span>
                    <span
                      className="font-mono text-[10.5px] tracking-wider px-1.5 py-0.5 rounded border"
                      style={{
                        color,
                        borderColor: `${color}55`,
                        background: `${color}12`,
                      }}
                    >
                      {TIER_LABEL[step.strategy].toUpperCase()}
                    </span>
                    {isStart && (
                      <span className="font-mono text-[9.5px] tracking-wider text-zinc-500 border border-white/10 rounded px-1.5 py-0.5">
                        DÉPART
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[16px] font-medium tabular-nums text-zinc-100">
                    <AnimatedCounter
                      value={step.price}
                      suffix=" €"
                      decimals={0}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="font-mono text-[10.5px] text-zinc-600 leading-relaxed pt-1 border-t border-white/5">
          Seuils indicatifs, ajustés à la catégorie.
        </div>
      </div>
    </section>
  );
}

export { EstimatorSellDecay };