import { type BuildsKpis } from "./buildsDatasets";
import { formatEur } from "./datasets";

type Props = { kpis: BuildsKpis };

export default function StockBuildsKpiTiles({ kpis }: Props) {
  const breakdown = `${kpis.inProgressCount} mont. · ${kpis.testedCount} testé · ${kpis.listedCount} listé`;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Tile
        label="BUILDS ACTIFS"
        value={String(kpis.activeCount)}
        subtitle={breakdown}
      />
      <Tile
        label="COÛT IMMOBILISÉ"
        value={`${formatEur(kpis.totalImmobilizedEur)} €`}
        subtitle="somme coûts builds actifs"
      />
      <Tile
        label="MARGE BUILDS VENDUS"
        value={`${kpis.margeBuildsVendusEur >= 0 ? "+" : ""}${formatEur(kpis.margeBuildsVendusEur)} €`}
        subtitle={
          kpis.countBuildsVendus > 0
            ? `${kpis.countBuildsVendus} build${kpis.countBuildsVendus > 1 ? "s" : ""} · marge moy. ${kpis.margeMoyennePct != null ? `${kpis.margeMoyennePct >= 0 ? "+" : ""}${kpis.margeMoyennePct.toFixed(1)}%` : "—"}`
            : "aucun build vendu"
        }
        accent="green"
        valueColor="#10B981"
      />
      <Tile
        label="BUILDS DORMANTS"
        value={String(kpis.dormantCount)}
        subtitle={kpis.dormantCount > 0 ? "à finaliser ou liquider" : "> 60 jours"}
        accent={kpis.dormantCount > 0 ? "amber" : "neutral"}
        valueColor={kpis.dormantCount > 0 ? "#F59E0B" : "#FAFAFA"}
        subtitleColor={kpis.dormantCount > 0 ? "#F59E0B" : "#71717A"}
      />
      <Tile
        label="PERTES BUILDS"
        value={`${kpis.pertesEur > 0 ? "−" : ""}${formatEur(kpis.pertesEur)} €`}
        subtitle={
          kpis.failedCount > 0
            ? `${kpis.failedCount} build${kpis.failedCount > 1 ? "s" : ""} failed`
            : "aucun échec"
        }
        accent={kpis.failedCount > 0 ? "red" : "neutral"}
        valueColor={kpis.failedCount > 0 ? "#EF4444" : "#FAFAFA"}
      />
    </div>
  );
}

type Accent = "neutral" | "green" | "amber" | "red";

const ACCENT_BG: Record<Accent, string> = {
  neutral: "rgba(255,255,255,0.02)",
  green: "rgba(16,185,129,0.06)",
  amber: "rgba(245,158,11,0.04)",
  red: "rgba(239,68,68,0.04)",
};
const ACCENT_BORDER: Record<Accent, string> = {
  neutral: "inset 0 0 0 1px rgba(255,255,255,0.05)",
  green: "inset 0 0 0 1px rgba(16,185,129,0.32)",
  amber: "inset 0 0 0 1px rgba(245,158,11,0.22)",
  red: "inset 0 0 0 1px rgba(239,68,68,0.22)",
};

function Tile({
  label,
  value,
  subtitle,
  accent = "neutral",
  valueColor = "#FAFAFA",
  subtitleColor = "#71717A",
}: {
  label: string;
  value: string;
  subtitle: string;
  accent?: Accent;
  valueColor?: string;
  subtitleColor?: string;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: ACCENT_BG[accent], boxShadow: ACCENT_BORDER[accent] }}
    >
      <div className="font-mono text-[10.5px] tracking-[0.18em] text-zinc-600">
        {label}
      </div>
      <div
        className="mt-3 font-mono text-[22px] font-medium tabular-nums"
        style={{ color: valueColor }}
      >
        {value}
      </div>
      <div
        className="mt-1 font-mono text-[10.5px]"
        style={{ color: subtitleColor }}
      >
        {subtitle}
      </div>
    </div>
  );
}