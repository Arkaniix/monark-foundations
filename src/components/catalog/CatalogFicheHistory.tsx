import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import SectionLabel from "../ui/SectionLabel";
import GlossaryTooltip from "../ui/GlossaryTooltip";
import AnimatedCounter from "../ui/AnimatedCounter";
import useReducedMotion from "@/lib/useReducedMotion";
import type { MonthlyHistoryEntry } from "./modelDetail";

type Props = { monthly_history: MonthlyHistoryEntry[] };

export default function CatalogFicheHistory({ monthly_history }: Props) {
  const reducedMotion = useReducedMotion();
  const [isAnimated, setIsAnimated] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setIsAnimated(true);
      return;
    }
    const t = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  if (monthly_history.length === 0) return null;
  const chronological = [...monthly_history].reverse();
  const max = Math.max(...chronological.map((m) => m.median_eur));
  const min = Math.min(...chronological.map((m) => m.median_eur));

  return (
    <section className="flex flex-col gap-3.5">
      <SectionLabel idx={5} label="HISTORIQUE 6 MOIS" />
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--mk-surface-1)",
          border: "0.5px solid var(--mk-section-border)",
        }}
      >
        <div className="mb-5">
          <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
            {chronological.map((m, i) => {
              const range = max - min || 1;
              const ratio = (m.median_eur - min) / range;
              const h = 24 + ratio * 70;
              const isAnnotated = m.annotation !== null;
              const barColor =
                m.annotation === "peak"
                  ? "#10B981"
                  : m.annotation === "trough"
                    ? "#EF4444"
                    : "rgba(255,255,255,0.18)";
              const animatedHeight = isAnimated ? h : 0;
              const animatedOpacity = isAnimated ? (isAnnotated ? 0.85 : 1) : 0;
              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center justify-end gap-2"
                  style={{ minHeight: 100 }}
                >
                  <div
                    className="font-mono text-[9.5px] tabular-nums"
                    style={{
                      color: isAnnotated ? barColor : "#71717a",
                      opacity: isAnimated ? 1 : 0,
                      transition: reducedMotion
                        ? "none"
                        : `opacity 400ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 40}ms`,
                    }}
                  >
                    <AnimatedCounter value={m.median_eur} delay={i * 40} />
                  </div>
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: animatedHeight,
                      background: barColor,
                      opacity: animatedOpacity,
                      transition: reducedMotion
                        ? "none"
                        : `height 600ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 40}ms, opacity 400ms ease-out ${i * 40}ms`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-2">
            {chronological.map((m, i) => (
              <div
                key={i}
                className="flex-1 text-center font-mono text-[9px] tracking-[0.1em] text-zinc-600"
              >
                {m.month_label.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>

        <table className="w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="font-mono text-[9.5px] tracking-[0.16em] text-zinc-600">
              <th className="px-2 py-2.5 text-left font-normal" style={th}>MOIS</th>
              <th className="px-2 py-2.5 text-right font-normal" style={th}>MÉDIANE</th>
              <th className="px-2 py-2.5 text-right font-normal" style={th}>
                <GlossaryTooltip term="deltaMoisPrec" position="bottom"><span>Δ M-1</span></GlossaryTooltip>
              </th>
              <th className="px-2 py-2.5 text-right font-normal" style={th}>N OBS</th>
              <th className="px-2 py-2.5 text-left font-normal" style={th}>ANNOTATION</th>
            </tr>
          </thead>
          <tbody>
            {monthly_history.map((m, i) => (
              <HistoryRow key={i} m={m} isFirst={i === monthly_history.length - 1} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const th = { borderBottom: "0.5px solid rgba(255,255,255,0.06)" } as const;

function HistoryRow({ m, isFirst }: { m: MonthlyHistoryEntry; isFirst: boolean }) {
  const deltaColor = m.delta_pct > 0.5 ? "#10B981" : m.delta_pct < -0.5 ? "#EF4444" : "#71717a";
  const sign = m.delta_pct > 0 ? "+" : "";
  return (
    <tr>
      <td className="px-2 py-2 font-mono text-zinc-100">{m.month_label}</td>
      <td className="px-2 py-2 text-right font-mono tabular-nums text-zinc-300">
        <AnimatedCounter value={m.median_eur} suffix=" €" />
      </td>
      <td className="px-2 py-2 text-right font-mono tabular-nums" style={{ color: deltaColor }}>
        {isFirst ? (
          <span className="text-zinc-700">—</span>
        ) : (
          <AnimatedCounter value={m.delta_pct} prefix={sign} suffix="%" decimals={1} />
        )}
      </td>
      <td className="px-2 py-2 text-right font-mono tabular-nums text-zinc-500">
        <AnimatedCounter value={m.n_obs} />
      </td>
      <td className="px-2 py-2 font-mono text-[10px] tracking-[0.08em]">
        {m.annotation === "peak" ? (
          <GlossaryTooltip term="pic">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <TrendingUp size={10} strokeWidth={2} /> PIC
            </span>
          </GlossaryTooltip>
        ) : m.annotation === "trough" ? (
          <GlossaryTooltip term="plancher">
            <span className="inline-flex items-center gap-1 text-red-400">
              <TrendingDown size={10} strokeWidth={2} /> PLANCHER
            </span>
          </GlossaryTooltip>
        ) : (
          <span className="text-zinc-700">stable</span>
        )}
      </td>
    </tr>
  );
}