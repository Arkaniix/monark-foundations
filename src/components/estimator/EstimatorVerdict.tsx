import { ConfidenceGauge, Pill, VerdictCrystal } from "@/components/ui";
import {
  VERDICT_COLORS,
  VERDICT_DISPLAY_LABELS,
  VERDICT_GLOW_CLASS,
  type EstimatorResult,
} from "./datasets";

type EstimatorVerdictProps = {
  result: EstimatorResult;
};

export default function EstimatorVerdict({ result }: EstimatorVerdictProps) {
  const color = VERDICT_COLORS[result.verdict];
  const label = VERDICT_DISPLAY_LABELS[result.verdict];
  const glow = VERDICT_GLOW_CLASS[result.verdict];
  const { net_margin_eur, fair_price_eur, modifiers, confidence_pct } = result;

  const marginSign = net_margin_eur >= 0 ? "+" : "";
  const marginColor = net_margin_eur >= 0 ? "#10B981" : "#EF4444";

  return (
    <div className="mk-card p-6 fade-up flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          VERDICT
        </div>
        <div className="font-mono text-[10px] tracking-wider text-zinc-600">
          {result.model_name} · {result.category}
        </div>
      </div>

      <div className="flex flex-col items-center text-center gap-3">
        <VerdictCrystal color={color} size={140} />

        <div
          className={"text-[28px] font-semibold tracking-tight mt-1 " + glow}
          style={{ color }}
        >
          {label}
        </div>

        <div className="text-[13px] text-zinc-400">
          Marge nette estimée :{" "}
          <span className="font-mono font-medium" style={{ color: marginColor }}>
            {marginSign}
            {net_margin_eur} €
          </span>
          {" · Fair price "}
          <span className="font-mono text-zinc-200">{fair_price_eur} €</span>
        </div>

        <ConfidenceGauge value={confidence_pct} color={color} />

        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
          <Pill
            label={`Trend ${modifiers.trend_14d >= 0 ? "+" : ""}${modifiers.trend_14d}`}
            color={modifiers.trend_14d >= 0 ? "#10B981" : "#EF4444"}
          />
          <Pill
            label={`Liquidité ${modifiers.liquidity_mod >= 0 ? "+" : ""}${modifiers.liquidity_mod}`}
            color={modifiers.liquidity_mod >= 0 ? "#10B981" : "#EF4444"}
          />
          <Pill
            label={`Value-vs-new ${modifiers.value_vs_new >= 0 ? "+" : ""}${modifiers.value_vs_new}`}
            color={modifiers.value_vs_new >= 0 ? "#10B981" : "#EF4444"}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5">
        <MetricCell
          label="PRIX DEMANDÉ"
          value={`${result.inputs.ask_price_eur} €`}
        />
        <MetricCell label="FAIR PRICE" value={`${fair_price_eur} €`} />
        <MetricCell
          label="MARGE NETTE"
          value={`${marginSign}${net_margin_eur} €`}
          color={marginColor}
        />
        <MetricCell
          label="FRAIS PLATEFORME"
          value={`${result.platform_fees_pct} %`}
        />
      </div>
    </div>
  );
}

function MetricCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="font-mono text-[9px] tracking-wider text-zinc-500">
        {label}
      </div>
      <div
        className="font-mono text-[14px] text-zinc-100"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

export { EstimatorVerdict };