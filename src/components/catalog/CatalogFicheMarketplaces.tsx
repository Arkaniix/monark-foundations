import SectionLabel from "../ui/SectionLabel";
import GlossaryTooltip from "../ui/GlossaryTooltip";
import AnimatedCounter from "../ui/AnimatedCounter";
import AnimatedBar from "../ui/AnimatedBar";
import type { PlatformBreakdown } from "./modelDetail";
import { PLATFORM_BRAND_COLORS } from "./modelDetail";

type Props = {
  by_platform: PlatformBreakdown[];
  global_median_eur: number;
};

export default function CatalogFicheMarketplaces({ by_platform }: Props) {
  const totalObs = by_platform.reduce((sum, p) => sum + p.n_obs, 0);

  return (
    <section className="flex flex-col gap-3.5">
      <SectionLabel idx={4} label="OÙ SE VEND CE MODÈLE ?" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {by_platform.map((p) => (
          <PlatformCard key={p.platform} entry={p} totalObs={totalObs} />
        ))}
      </div>
      <div className="font-mono text-[10.5px] leading-relaxed text-zinc-600">
        Part de volume = % des ventes observées sur cette plateforme. Reflète où les acheteurs cherchent et où les vendeurs listent.
      </div>
    </section>
  );
}

function PlatformCard({
  entry,
  totalObs,
}: {
  entry: PlatformBreakdown;
  totalObs: number;
}) {
  const brand = PLATFORM_BRAND_COLORS[entry.platform];
  const spreadColor =
    entry.spread_vs_global_pct > 1
      ? "#10B981"
      : entry.spread_vs_global_pct < -1
        ? "#EF4444"
        : "#71717a";
  const spreadSign = entry.spread_vs_global_pct > 0 ? "+" : "";
  const volumeSharePct = totalObs > 0 ? (entry.n_obs / totalObs) * 100 : 0;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--mk-surface-1)",
        border: "0.5px solid var(--mk-section-border)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: brand }} />
        <span className="font-mono text-[10.5px] font-medium tracking-[0.16em] text-zinc-100">
          {entry.platform.toUpperCase()}
        </span>
      </div>

      <div className="mb-0.5 font-mono text-[22px] font-medium tabular-nums text-zinc-100">
        <AnimatedCounter value={entry.median_eur} suffix=" €" />
      </div>
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-zinc-600">
        <GlossaryTooltip term="median30d"><span>MÉDIANE</span></GlossaryTooltip>
        <GlossaryTooltip term="spreadGlobal">
          <span style={{ color: spreadColor }}>
            <AnimatedCounter
              value={entry.spread_vs_global_pct}
              prefix={spreadSign}
              suffix="% vs global"
              decimals={1}
            />
          </span>
        </GlossaryTooltip>
      </div>

      <div
        className="mb-3 rounded-md p-3"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mb-1.5 flex items-baseline justify-between">
          <GlossaryTooltip term="partVolume">
            <span className="font-mono text-[9px] tracking-[0.16em] text-zinc-500">PART DE VOLUME</span>
          </GlossaryTooltip>
          <span className="font-mono text-[16px] font-medium tabular-nums" style={{ color: brand }}>
            <AnimatedCounter value={volumeSharePct} suffix="%" decimals={0} />
          </span>
        </div>
        <AnimatedBar percent={volumeSharePct} color={brand} />
      </div>

      <div className="font-mono text-[10px] tracking-[0.08em] text-zinc-600">
        <GlossaryTooltip term="observations">
          <span>
            <span>N OBS </span>
            <span className="text-zinc-300"><AnimatedCounter value={entry.n_obs} /></span>
            <span className="text-zinc-700"> · 30 J</span>
          </span>
        </GlossaryTooltip>
      </div>
    </div>
  );
}
