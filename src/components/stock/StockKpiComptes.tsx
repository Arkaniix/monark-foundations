import {
  computeMargeNetteGlobaleEur,
  computeRatioDepensesCa,
  formatEurSigned,
  type AccountingKpi,
} from "./accountingDatasets";

type Props = {
  kpi: AccountingKpi;
  caEur: number;
  margeVentesEur: number;
};

const NBSP = "\u00A0";

function fmt(v: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

export default function StockKpiComptes({ kpi, caEur, margeVentesEur }: Props) {
  const margeGlobale = computeMargeNetteGlobaleEur(margeVentesEur, kpi.netBalanceEur);
  const ratio = computeRatioDepensesCa(kpi.expensesTotalEur, caEur);

  const netSign = kpi.netBalanceEur >= 0 ? "#10B981" : "#EF4444";
  const margeSign = margeGlobale >= 0 ? "#10B981" : "#EF4444";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Tile
        label="DÉPENSES CUMULÉES"
        value={`−${fmt(kpi.expensesTotalEur)}${NBSP}€`}
        valueColor="#EF4444"
        subtitle={`${kpi.countExpenses} entrée${kpi.countExpenses > 1 ? "s" : ""}`}
        bg="rgba(239,68,68,0.04)"
        ring="rgba(239,68,68,0.22)"
      />
      <Tile
        label="GAINS EXTERNES"
        value={`+${fmt(kpi.incomesTotalEur)}${NBSP}€`}
        valueColor="#10B981"
        subtitle={`${kpi.countIncomes} entrée${kpi.countIncomes > 1 ? "s" : ""}`}
        bg="rgba(16,185,129,0.04)"
        ring="rgba(16,185,129,0.22)"
      />
      <Tile
        label="SOLDE NET"
        value={formatEurSignedAbs(kpi.netBalanceEur)}
        valueColor={netSign}
        subtitle="gains − dépenses"
      />
      <Tile
        label="MARGE NETTE GLOBALE"
        value={formatEurSignedAbs(margeGlobale)}
        valueColor={margeSign}
        subtitle="marge ventes + solde"
        bg="rgba(16,185,129,0.06)"
        ring="rgba(16,185,129,0.32)"
      />
      <Tile
        label="RATIO DÉP. / CA"
        value={ratio == null ? "—" : `${ratio.toFixed(1)}${NBSP}%`}
        subtitle={
          caEur > 0
            ? `${fmt(kpi.expensesTotalEur)} / ${fmt(caEur)}${NBSP}€`
            : "aucun CA"
        }
      />
    </div>
  );
}

function formatEurSignedAbs(value: number): string {
  if (value === 0) return `0${NBSP}€`;
  const sign = value > 0 ? "+" : "−";
  return `${sign}${fmt(Math.abs(value))}${NBSP}€`;
}

function Tile({
  label,
  value,
  subtitle,
  valueColor = "#FAFAFA",
  bg = "rgba(255,255,255,0.02)",
  ring = "rgba(255,255,255,0.05)",
}: {
  label: string;
  value: string;
  subtitle: string;
  valueColor?: string;
  bg?: string;
  ring?: string;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: bg,
        boxShadow: `inset 0 0 0 1px ${ring}`,
      }}
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
      <div className="mt-1 font-mono text-[10.5px] text-zinc-500">{subtitle}</div>
    </div>
  );
}