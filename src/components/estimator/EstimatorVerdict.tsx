import { ConfidenceGauge, Pill, VerdictCrystal } from "@/components/ui";
import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { GlossaryKey } from "@/lib/glossary";
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
  const verdictTermMap: Record<string, GlossaryKey> = {
    FONCER: "verdictFoncer",
    "NÉGOCIER": "verdictNegocier",
    TENTER: "verdictTenter",
    PASSER: "verdictPasser",
  };
  const verdictTerm = verdictTermMap[result.verdict] ?? "verdict";

  return (
    <div className="mk-card p-6 fade-up flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          <GlossaryTooltip term="verdict" position="bottom"><span>VERDICT</span></GlossaryTooltip>
        </div>
        <div className="font-mono text-[10px] tracking-wider text-zinc-600">
          {result.model_name} · {result.category}
        </div>
      </div>

      <div className="flex flex-col items-center text-center gap-3">
        <VerdictCrystal color={color} size={140} />

        <GlossaryTooltip term={verdictTerm}>
          <span
            className={"text-[28px] font-semibold tracking-tight mt-1 " + glow}
            style={{ color }}
          >
            {label}
          </span>
        </GlossaryTooltip>

        {/* Score /100 avec barre */}
        <div className="w-full max-w-[280px] mt-2">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-mono text-[10px] tracking-wider text-zinc-500">
              <GlossaryTooltip term="score"><span>SCORE</span></GlossaryTooltip>
            </span>
            <span className="font-mono text-[12px] text-zinc-300">
              <span
                className="text-[18px] font-semibold tabular-nums"
                style={{ color: scoreColor }}
              >
                <AnimatedCounter value={score_total} />
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
            <AnimatedCounter value={net_margin_eur} prefix={marginSign} suffix=" €" />
          </span>
          {" · Fair "}
          <span className="font-mono text-zinc-200">
            <AnimatedCounter value={fair_price_eur} suffix=" €" />
          </span>
          {" · Frais "}
          <span className="font-mono text-zinc-200">
            <AnimatedCounter value={platform_fees_pct} suffix=" %" />
          </span>
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
          value={<AnimatedCounter value={landmarks.ceiling_buy_eur} suffix=" €" />}
          hint="à ne pas dépasser"
          color="#EF4444"
          termKey="plafond"
        />
        <LandmarkCell
          label="ACHAT OPTIMAL"
          value={<AnimatedCounter value={landmarks.optimal_buy_eur} suffix=" €" />}
          hint="prix idéal"
          color="#10B981"
          termKey="optimal"
        />
        <LandmarkCell
          label="PLANCHER REVENTE"
          value={<AnimatedCounter value={landmarks.floor_resale_eur} suffix=" €" />}
          hint="breakeven post-frais"
          color="#3B82F6"
          termKey="plancherEstimator"
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
  termKey,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  color: string;
  termKey?: GlossaryKey;
}) {
  const labelEl = (
    <span className="font-mono text-[9px] tracking-wider text-zinc-500">{label}</span>
  );
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div>{termKey ? <GlossaryTooltip term={termKey}>{labelEl}</GlossaryTooltip> : labelEl}</div>
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
