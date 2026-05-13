import SectionLabel from "../ui/SectionLabel";
import type { PlatformBreakdown } from "./modelDetail";
import { PLATFORM_BRAND_COLORS } from "./modelDetail";

type Props = {
  by_platform: PlatformBreakdown[];
  global_median_eur: number;
};

export default function CatalogFicheMarketplaces({ by_platform }: Props) {
  return (
    <section className="flex flex-col gap-3.5">
      <SectionLabel idx={4} label="RÉPARTITION PAR PLATEFORME" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {by_platform.map((p) => (
          <PlatformCard key={p.platform} entry={p} />
        ))}
      </div>
      <div className="font-mono text-[10.5px] leading-relaxed text-zinc-600">
        Médiane nette = médiane plateforme × (1 − frais). Spread vs global mesure
        l'écart de prix observé entre la plateforme et la médiane globale agrégée.
      </div>
    </section>
  );
}

function PlatformCard({ entry }: { entry: PlatformBreakdown }) {
  const brand = PLATFORM_BRAND_COLORS[entry.platform];
  const spreadColor =
    entry.spread_vs_global_pct > 1 ? "#10B981" : entry.spread_vs_global_pct < -1 ? "#EF4444" : "#71717a";
  const spreadSign = entry.spread_vs_global_pct > 0 ? "+" : "";

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
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-zinc-600">
        <span>MÉDIANE</span>
        <span style={{ color: spreadColor }}>
          {spreadSign}{entry.spread_vs_global_pct.toFixed(1)}% vs global
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2.5" style={{ borderTop: "0.5px solid var(--mk-divider-soft)" }}>
        <MetricRow label="N OBS" value={entry.n_obs.toString()} />
        <MetricRow label="FRAIS" value={`${entry.fees_pct}%`} />
        <MetricRow label="MÉDIANE NETTE" value={`${entry.net_median_eur} €`} highlight />
        <MetricRow label="SPREAD" value={`${spreadSign}${entry.spread_vs_global_pct.toFixed(1)}%`} color={spreadColor} />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  highlight = false,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[8.5px] tracking-[0.14em] text-zinc-600">{label}</div>
      <div
        className="font-mono text-[12px] tabular-nums"
        style={{
          color: color ?? (highlight ? "#f4f4f5" : "#a1a1aa"),
          fontWeight: highlight ? 500 : 400,
        }}
      >
        {value}
      </div>
    </div>
  );
}