import { getScoreColor, type EstimatorResult } from "./datasets";
import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { GlossaryKey } from "@/lib/glossary";

type EstimatorScoreBreakdownProps = {
  result: EstimatorResult;
};

/**
 * Section §03 — Décomposition du score.
 *
 * Transparence du calcul du score composite : composantes décomposées
 * (base + 3 modificateurs = total) + quality flags (observations, fraîcheur,
 * scope plateforme) + Confiance.
 */
export default function EstimatorScoreBreakdown({
  result,
}: EstimatorScoreBreakdownProps) {
  const { score_breakdown, data_quality, confidence_pct, confidence_state, inputs } = result;
  const { base, trend, liquidity, value_vs_new, total_adjusted, total } = score_breakdown;
  const isClamped = base + total_adjusted !== total;
  const scoreColor = getScoreColor(total);
  const confidenceColor = getScoreColor(confidence_pct);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 05
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          DÉCOMPOSITION DU SCORE
        </div>
      </div>

      <div className="mk-card p-6 fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche : composantes */}
          <div className="flex flex-col gap-4">
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
              SIGNAUX
            </div>

            <div className="flex flex-col gap-2.5">
              <BreakdownRow label="Tendance" hint="14 j" value={trend} signed termKey="trend30d" />
              <BreakdownRow label="Liquidité" hint="rotation marché" value={liquidity} signed termKey="liquidity" />
              <BreakdownRow label="Décote vs neuf" hint="état" value={value_vs_new} signed termKey="decoteVsNeuf" />
              <div className="h-px bg-white/10 my-1" />
              <BreakdownRow label="Score de base" hint="position prix" value={base} termKey="scoreBase" />
              <BreakdownRow label="Ajustement net" hint="pondéré confiance" value={total_adjusted} signed />
              <BreakdownRow label="Score final" value={total} final termKey="score" />
            </div>

            {/* Barre de score */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${total}%`,
                    background: scoreColor,
                    boxShadow: `0 0 12px ${scoreColor}80`,
                  }}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[9px] tracking-wider text-zinc-600">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">
              Signaux bruts ; l'ajustement net applique la pondération de confiance.
              {isClamped && " Score plafonné à 100."}
            </p>
          </div>

          {/* Colonne droite : sources & confiance */}
          <div className="flex flex-col gap-4">
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
              SOURCES & FIABILITÉ
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-[13px] text-zinc-300">
                <span className="text-emerald-400 mt-0.5">●</span>
                <span>
                  <span className="font-mono text-zinc-100">
                    {data_quality.observations_count}
                  </span>{" "}
                  observations sold composite ·{" "}
                  <span className="text-zinc-500">180 j</span>
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-[13px] text-zinc-300">
                <span className="text-emerald-400 mt-0.5">●</span>
                <span>
                  Données fraîches{" "}
                  <span className="font-mono text-zinc-100">
                    ≤ {data_quality.fresh_within_hours} h
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-[13px] text-zinc-300">
                <span className="text-emerald-400 mt-0.5">●</span>
                <span>
                  {data_quality.platform_specific ? (
                    <>
                      Stats spécifiques à la plateforme{" "}
                      <span className="font-mono text-zinc-100">
                        {inputs.platform}
                      </span>
                    </>
                  ) : (
                    "Stats agrégées multi-plateformes"
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="font-mono text-[9.5px] tracking-wider text-zinc-500 mb-2">
                CONFIANCE GLOBALE
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-mono text-[34px] font-semibold tracking-tight"
                  style={{ color: confidenceColor }}
                >
                  <AnimatedCounter value={confidence_pct} />
                </span>
                <span className="font-mono text-[14px] text-zinc-500">%</span>
              </div>
              {confidence_state === "insufficient" && (
                <div
                  className="mt-1.5 font-mono text-[10px] leading-relaxed"
                  style={{ color: "#F59E0B" }}
                >
                  Données insuffisantes — estimation à confiance réduite.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BreakdownRow({
  label,
  hint,
  value,
  signed = false,
  final = false,
  termKey,
}: {
  label: string;
  hint?: string;
  value: number;
  signed?: boolean;
  final?: boolean;
  termKey?: GlossaryKey;
}) {
  const valueColor = !signed
    ? "#fafafa"
    : value > 0
      ? "#10B981"
      : value < 0
        ? "#EF4444"
        : "#71717a";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        {(() => {
          const labelEl = (
            <span
              className={
                final
                  ? "text-[13px] font-medium text-zinc-100"
                  : "text-[13px] text-zinc-300"
              }
            >
              {label}
            </span>
          );
          return termKey ? <GlossaryTooltip term={termKey}>{labelEl}</GlossaryTooltip> : labelEl;
        })()}
        {hint && (
          <span className="font-mono text-[10px] text-zinc-600">{hint}</span>
        )}
      </div>
      <span
        className={
          final
            ? "font-mono text-[18px] font-semibold tabular-nums"
            : "font-mono text-[14px] tabular-nums"
        }
        style={{ color: final ? "#fafafa" : valueColor }}
      >
        <AnimatedCounter value={value} prefix={signed && value >= 0 ? "+" : ""} />
      </span>
    </div>
  );
}

export { EstimatorScoreBreakdown };
