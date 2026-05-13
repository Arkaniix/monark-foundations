import SectionLabel from "../ui/SectionLabel";
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
        {entry.median_eur} €
      </div>
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-zinc-600">
        <span>MÉDIANE</span>
        <span style={{ color: spreadColor }}>
          {spreadSign}{entry.spread_vs_global_pct.toFixed(1)}% vs global
        </span>
      </div>

      <div
        className="mb-3 rounded-md p-3"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-mono text-[9px] tracking-[0.16em] text-zinc-500">PART DE VOLUME</span>
          <span className="font-mono text-[16px] font-medium tabular-nums" style={{ color: brand }}>
            {volumeSharePct.toFixed(0)}%
          </span>
        </div>
        <div className="relative h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: `${volumeSharePct}%`, background: brand }}
          />
        </div>
      </div>

      <div className="font-mono text-[10px] tracking-[0.08em] text-zinc-600">
        <span>N OBS </span>
        <span className="text-zinc-300">{entry.n_obs}</span>
        <span className="text-zinc-700"> · 30 J</span>
      </div>
    </div>
  );
}
