import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { SellResult } from "./datasets";

const TIMING_LABEL = {
  good: "Favorable",
  neutral: "Neutre",
  cautious: "Prudence",
  bad: "Défavorable",
} as const;

const TIMING_COLOR = {
  good: "#10B981",
  neutral: "#71717A",
  cautious: "#F59E0B",
  bad: "#EF4444",
} as const;

type Props = { result: SellResult };

export default function EstimatorSellProjection({ result }: Props) {
  const proj = result.projection;
  if (!proj) return null;
  const color = TIMING_COLOR[proj.timing];
  const label = TIMING_LABEL[proj.timing];
  const trendSign = (proj.trend_30d_pct ?? 0) >= 0 ? "+" : "";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 04
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          QUAND VENDRE
        </div>
      </div>

      <div className="mk-card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-md font-mono text-[10.5px] tracking-wider border"
            style={{
              color,
              borderColor: `${color}55`,
              background: `${color}12`,
            }}
          >
            {label.toUpperCase()}
          </span>
          {proj.trend_30d_pct !== null && (
            <span className="font-mono text-[12px] text-zinc-300 tabular-nums">
              {trendSign}
              <AnimatedCounter
                value={proj.trend_30d_pct}
                suffix=" %"
                decimals={1}
              />
              <span className="text-zinc-500"> sur 30 j</span>
            </span>
          )}
        </div>

        {proj.narrative && (
          <p className="text-[13.5px] text-zinc-300 leading-relaxed">
            {proj.narrative}
          </p>
        )}

        {proj.projected_patient_value !== null && (
          <div className="pt-3 border-t border-white/5 text-[12.5px] text-zinc-400 leading-relaxed">
            Valeur projetée si tu patientes : ~
            <span className="font-mono text-zinc-200 tabular-nums">
              <AnimatedCounter
                value={proj.projected_patient_value}
                suffix=" €"
                decimals={0}
              />
            </span>
            <span className="text-zinc-600">
              {" "}
              — projection, pas une garantie.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export { EstimatorSellProjection };