import { ConfidenceGauge, Pill, VerdictCrystal } from "@/components/ui";
import {
  VERDICT_COLORS,
  VERDICT_DISPLAY_LABELS,
  VERDICT_GLOW_CLASS,
  getScoreColor,
  type EstimatorResult,
} from "./datasets";

type EstimatorVerdictProps = {
  result: EstimatorResult;
};

export default function EstimatorVerdict({ result }: EstimatorVerdictProps) {
  const color = VERDICT_COLORS[result.verdict];
  const scoreColor = getScoreColor(result.score_total);
  const label = VERDICT_DISPLAY_LABELS[result.verdict];
  const glow = VERDICT_GLOW_CLASS[result.verdict];
  const {
    net_margin_eur,
    fair_price_eur,
    modifiers,
    confidence_pct,
    score_total,
    landmarks,
    platform_fees_pct,
  } = result;

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

        {/* Score /100 avec barre */}
        <div className="w-full max-w-[280px] mt-2">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-mono text-[10px] tracking-wider text-zinc-500">
              SCORE
            </span>
            <span className="font-mono text-[12px] text-zinc-300">
              <span
                className="text-[18px] font-semibold tabular-nums"
                style={{ color: scoreColor }}
              >
                {score_total}
              </span>
              <span className="text-zinc-600"> / 100</span>
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${score_total}%`,
                background: scoreColor,
                boxShadow: `0 0 10px ${scoreColor}80`,
              }}
            />
          </div>
        </div>

        <div className="text-[13px] text-zinc-400">
          Marge nette estimée :{" "}
          <span className="font-mono font-medium" style={{ color: marginColor }}>
            {marginSign}
            {net_margin_eur} €
          </span>
          {" · Fair "}
          <span className="font-mono text-zinc-200">{fair_price_eur} €</span>
          {" · Frais "}
          <span className="font-mono text-zinc-200">{platform_fees_pct} %</span>
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
            label={`Décote ${modifiers.value_vs_new >= 0 ? "+" : ""}${modifiers.value_vs_new}`}
            color={modifiers.value_vs_new >= 0 ? "#10B981" : "#EF4444"}
          />
        </div>
      </div>

      {/* 3 Repères TL;DR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/5">
        <LandmarkCell
          label="PLAFOND ACHAT"
          value={`${landmarks.ceiling_buy_eur} €`}
          hint="à ne pas dépasser"
          color="#EF4444"
        />
        <LandmarkCell
          label="ACHAT OPTIMAL"
          value={`${landmarks.optimal_buy_eur} €`}
          hint="prix idéal"
          color="#10B981"
        />
        <LandmarkCell
          label="PLANCHER REVENTE"
          value={`${landmarks.floor_resale_eur} €`}
          hint="breakeven post-frais"
          color="#3B82F6"
        />
      </div>
    </div>
  );
}

function LandmarkCell({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="font-mono text-[9px] tracking-wider text-zinc-500">
        {label}
      </div>
      <div
        className="font-mono text-[15px] font-semibold tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
      <div className="font-mono text-[9px] text-zinc-600">{hint}</div>
    </div>
  );
}

export { EstimatorVerdict };
