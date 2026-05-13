import PercentileChart from "../ui/PercentileChart";
import SectionLabel from "../ui/SectionLabel";
import type { CatalogModelDetail } from "./modelDetail";

type Props = { detail: CatalogModelDetail };

export default function CatalogFichePercentiles({ detail }: Props) {
  const { p10, p25, p50, p75, p90 } = detail.percentiles;
  const iqr = p75 - p25;
  const spread = p90 - p10;
  const spreadPct = ((spread / p50) * 100).toFixed(1);
  const iqrPct = ((iqr / p50) * 100).toFixed(1);

  return (
    <section className="flex flex-col gap-3.5">
      <SectionLabel idx={2} label="OÙ SE POSITIONNE TYPIQUEMENT CE MODÈLE ?" />
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--mk-surface-1)",
          border: "0.5px solid var(--mk-section-border)",
        }}
      >
        <div className="grid grid-cols-[1fr_240px] gap-8">
          <PercentileChart
            distribution={detail.percentiles}
            color="#3B82F6"
            observationsLabel={`${detail.n_obs} OBS · 30 J`}
            chartTitle="DISPERSION DES PRIX SOLD · 30 J"
            chartHint="La zone dense au centre correspond aux prix les plus fréquents. Les extrêmes signalent des deals ou des prix au-dessus du marché."
          />
          <div className="flex flex-col gap-3 pt-1">
            <MetricHighlight
              label="ZONE TYPIQUE · P25 → P75"
              value={`${p25} € — ${p75} €`}
              sub="majorité des ventes observées"
            />
            <Metric label="FOURCHETTE P10 → P90" value={`${spread} €`} sub={`${spreadPct}% de la médiane`} />
            <Metric label="IQR P25 → P75" value={`${iqr} €`} sub={`${iqrPct}% de la médiane`} />
            <Metric label="MÉDIANE" value={`${p50} €`} sub="P50" />
          </div>
        </div>
      </div>
    </section>
  );
}

type MetricProps = { label: string; value: string; sub: string };

function Metric({ label, value, sub }: MetricProps) {
  return (
    <div className="flex flex-col gap-0.5 pb-2.5" style={{ borderBottom: "0.5px solid var(--mk-divider-soft)" }}>
      <div className="font-mono text-[9px] tracking-[0.16em] text-zinc-600">{label}</div>
      <div className="font-mono text-[14px] font-medium tabular-nums text-zinc-100">{value}</div>
      <div className="font-mono text-[9.5px] tracking-[0.04em] text-zinc-500">{sub}</div>
    </div>
  );
}

function MetricHighlight({ label, value, sub }: MetricProps) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-md p-2.5"
      style={{
        background: "rgba(59,130,246,0.06)",
        border: "0.5px solid rgba(59,130,246,0.2)",
      }}
    >
      <div className="font-mono text-[9px] tracking-[0.16em] text-blue-400">{label}</div>
      <div className="font-mono text-[14px] font-medium tabular-nums text-zinc-100">{value}</div>
      <div className="font-mono text-[9.5px] tracking-[0.04em] text-zinc-400">{sub}</div>
    </div>
  );
}
