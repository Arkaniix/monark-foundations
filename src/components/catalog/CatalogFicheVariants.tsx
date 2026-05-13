import type { KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import SectionLabel from "../ui/SectionLabel";
import GlossaryTooltip from "../ui/GlossaryTooltip";
import AnimatedCounter from "../ui/AnimatedCounter";
import type { VariantEntry } from "./modelDetail";
import { getScoreColor, getTrendColor, getLiquidityColor } from "./datasets";
type Props = {
  variants: VariantEntry[];
  familyLabel: string;
};

export default function CatalogFicheVariants({ variants, familyLabel }: Props) {
  if (variants.length === 0) return null;
  return (
    <section className="flex flex-col gap-3.5">
      <SectionLabel idx={3} label={`VARIANTS ${familyLabel.toUpperCase()}`} />
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: "var(--mk-surface-1)",
          border: "0.5px solid var(--mk-section-border)",
        }}
      >
        <table className="w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="font-mono text-[9.5px] tracking-[0.16em] text-zinc-600">
              <th className="px-4 py-2.5 text-left font-normal" style={th}>MODÈLE</th>
              <th className="px-2 py-2.5 text-left font-normal" style={th}>
                <GlossaryTooltip term="score" position="bottom"><span>SCORE</span></GlossaryTooltip>
              </th>
              <th className="px-2 py-2.5 text-right font-normal" style={th}>
                <GlossaryTooltip term="median30d" position="bottom"><span>MÉDIANE</span></GlossaryTooltip>
              </th>
              <th className="px-2 py-2.5 text-right font-normal" style={th}>
                <GlossaryTooltip term="trend30d" position="bottom"><span>TEND.</span></GlossaryTooltip>
              </th>
              <th className="px-2 py-2.5 text-right font-normal" style={th}>
                <GlossaryTooltip term="liquidity" position="bottom"><span>LIQ.</span></GlossaryTooltip>
              </th>
              <th className="px-4 py-2.5 text-right font-normal" style={th} />
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <VariantRow key={v.id} v={v} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const th = { borderBottom: "0.5px solid rgba(255,255,255,0.06)" } as const;

function VariantRow({ v }: { v: VariantEntry }) {
  const navigate = useNavigate();
  const scoreColor = getScoreColor(v.score);
  const trendColor = getTrendColor(v.trend_30d_pct);
  const liqColor = getLiquidityColor(v.liquidity_pct);
  const trendSign = v.trend_30d_pct > 0 ? "+" : "";

  if (v.is_current) {
    return (
      <tr style={{ background: "rgba(59,130,246,0.05)" }}>
        <td
          className="px-4 py-2.5 font-medium text-blue-300"
          style={{ borderLeft: "1.5px solid #3B82F6" }}
        >
          <span className="inline-flex items-center gap-2">
            <ArrowRight size={11} style={{ color: "#3B82F6" }} strokeWidth={1.75} />
            <span>{v.name}</span>
            <span className="ml-1 font-mono text-[9px] tracking-[0.1em] text-zinc-500">
              <GlossaryTooltip term="variantCourant"><span>COURANT</span></GlossaryTooltip>
            </span>
          </span>
        </td>
        <td className="px-2 py-2.5 font-mono font-medium" style={{ color: scoreColor }}>
          <AnimatedCounter value={v.score} />
        </td>
        <td className="px-2 py-2.5 text-right font-mono tabular-nums text-zinc-300">
          <AnimatedCounter value={v.median_eur} suffix=" €" />
        </td>
        <td className="px-2 py-2.5 text-right font-mono tabular-nums" style={{ color: trendColor }}>
          <AnimatedCounter value={v.trend_30d_pct} prefix={trendSign} suffix="%" decimals={1} />
        </td>
        <td className="px-2 py-2.5 text-right font-mono tabular-nums" style={{ color: liqColor }}>
          <AnimatedCounter value={v.liquidity_pct} suffix="%" />
        </td>
        <td className="px-4 py-2.5 text-right text-zinc-700" />
      </tr>
    );
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={() => {
        navigate({ to: "/catalogue/$modelId", params: { modelId: v.id } });
      }}
      onKeyDown={(e: KeyboardEvent<HTMLTableRowElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate({ to: "/catalogue/$modelId", params: { modelId: v.id } });
        }
      }}
      className="ease-expo cursor-pointer transition-colors hover:bg-white/[0.045] focus:bg-white/[0.045] focus:outline-none"
    >
      <td className="px-4 py-2.5 text-zinc-100">{v.name}</td>
      <td className="px-2 py-2.5 font-mono font-medium" style={{ color: scoreColor }}>
        <AnimatedCounter value={v.score} />
      </td>
      <td className="px-2 py-2.5 text-right font-mono tabular-nums text-zinc-300">
        <AnimatedCounter value={v.median_eur} suffix=" €" />
      </td>
      <td className="px-2 py-2.5 text-right font-mono tabular-nums" style={{ color: trendColor }}>
        <AnimatedCounter value={v.trend_30d_pct} prefix={trendSign} suffix="%" decimals={1} />
      </td>
      <td className="px-2 py-2.5 text-right font-mono tabular-nums" style={{ color: liqColor }}>
        <AnimatedCounter value={v.liquidity_pct} suffix="%" />
      </td>
      <td className="px-4 py-2.5 text-right">
        <span className="inline-flex text-zinc-500">
          <ArrowRight size={12} strokeWidth={1.5} />
        </span>
      </td>
    </tr>
  );
}