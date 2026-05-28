import type { CSSProperties } from "react";
import type {
  EstimatorResult,
  Platform,
  ResaleWhenOption,
} from "./datasets";
import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { GlossaryKey } from "@/lib/glossary";

const TIMING_TERMS: Record<string, GlossaryKey> = {
  RAPIDE: "timingRapide",
  OPTIMAL: "timingOptimal",
  PATIENT: "timingPatient",
};

const OPTIMAL_COLOR = "#10B981";
const MARGIN_POSITIVE = "#10B981";
const MARGIN_NEGATIVE = "#EF4444";
const DELAY_FAST = "#10B981";
const DELAY_MEDIUM = "#F59E0B";
const DELAY_SLOW = "#EF4444";

type EstimatorResaleWhenProps = {
  result: EstimatorResult;
  selectedPlatform: Platform;
};

/**
 * §05b — QUAND REVENDRE · sur {platform}.
 * Layout tableau dense : header de colonnes + 3 lignes empilées RAPIDE / OPTIMAL / PATIENT.
 */
export default function EstimatorResaleWhen({
  result,
  selectedPlatform,
}: EstimatorResaleWhenProps) {
  if (!result.resale_when) return null;
  const options = result.resale_when.by_platform[selectedPlatform] ?? [];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 05b
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          QUAND REVENDRE
        </div>
      </div>

      <div className="mk-card-flat-soft px-5 py-4">
        {/* Header — desktop only */}
        <div className="hidden md:grid grid-cols-[110px_90px_90px_120px_90px_1fr] gap-4 pb-3 mb-1 border-b border-white/[0.06]">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">TIMING</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">PRIX</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">DÉLAI</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            <GlossaryTooltip term="margeNette" position="bottom"><span>MARGE NETTE</span></GlossaryTooltip>
          </div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">ACCEPT.</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">STRATÉGIE</div>
        </div>

        {options.map((opt, idx) => (
          <TimingRow key={opt.timing} option={opt} hasTopBorder={idx > 0} />
        ))}
      </div>

      <div className="font-mono text-[10.5px] text-zinc-600 leading-relaxed">
        Marge nette à ce timing = prix attendu × (1 − frais) − prix d'achat de
        référence ({result.resale_where?.cost_basis_eur ?? 0} €). Délais et
        probabilités estimés.
      </div>
    </section>
  );
}

function TimingRow({
  option,
  hasTopBorder,
}: {
  option: ResaleWhenOption;
  hasTopBorder: boolean;
}) {
  const isOptimal = option.is_top_pick;
  const marginSign = option.net_margin_eur >= 0 ? "+" : "";
  const marginColor =
    option.net_margin_eur >= 0 ? MARGIN_POSITIVE : MARGIN_NEGATIVE;
  const delayColor =
    option.expected_delay_days <= 7
      ? DELAY_FAST
      : option.expected_delay_days <= 21
        ? DELAY_MEDIUM
        : DELAY_SLOW;
  const accColor =
    option.acceptance_probability_pct >= 75
      ? "#10B981"
      : option.acceptance_probability_pct >= 50
        ? "#F59E0B"
        : "#EF4444";

  const baseBg = isOptimal ? "rgba(255,255,255,0.018)" : "transparent";
  const hoverBg = isOptimal
    ? "rgba(255,255,255,0.038)"
    : "rgba(255,255,255,0.025)";

  const rowStyle: CSSProperties = {
    backgroundColor: baseBg,
    borderTop: hasTopBorder ? "0.5px solid var(--mk-divider-soft)" : undefined,
    ...({ "--mk-row-hover-bg": hoverBg } as CSSProperties),
  };

  return (
    <div className="mk-timing-row -mx-5 px-5" style={rowStyle}>
      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-[110px_90px_90px_120px_90px_1fr] gap-4 items-center py-3.5">
        <div className="flex items-center gap-2">
          <GlossaryTooltip term={TIMING_TERMS[option.timing] ?? "timingOptimal"}>
            <span
              className="font-mono text-[11px] tracking-[0.2em] font-medium"
              style={{ color: isOptimal ? "#e4e4e7" : "#a1a1aa" }}
            >
              {option.timing}
            </span>
          </GlossaryTooltip>
          {isOptimal && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: OPTIMAL_COLOR }}
              aria-label="Top pick"
            />
          )}
        </div>
        <div className="font-mono text-[14px] font-medium tabular-nums text-zinc-200">
          <AnimatedCounter value={option.expected_price_eur} suffix=" €" decimals={0} />
        </div>
        <div
          className="font-mono text-[14px] font-medium tabular-nums"
          style={{ color: delayColor }}
        >
          ~<AnimatedCounter value={option.expected_delay_days} suffix=" j" decimals={0} />
        </div>
        <div
          className="font-mono text-[14px] font-medium tabular-nums"
          style={{ color: marginColor }}
        >
          <AnimatedCounter
            value={option.net_margin_eur}
            prefix={marginSign}
            suffix=" €"
            decimals={0}
          />
        </div>
        <div
          className="font-mono text-[14px] font-medium tabular-nums"
          style={{ color: accColor }}
        >
          <AnimatedCounter value={option.acceptance_probability_pct} suffix=" %" decimals={0} />
        </div>
        <div className="text-[12.5px] text-zinc-400 leading-relaxed">
          {option.narrative}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between">
          <GlossaryTooltip term={TIMING_TERMS[option.timing] ?? "timingOptimal"}>
            <span
              className="font-mono text-[11px] tracking-[0.2em] font-medium"
              style={{ color: isOptimal ? "#e4e4e7" : "#a1a1aa" }}
            >
              {option.timing}
            </span>
          </GlossaryTooltip>
          {isOptimal && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: OPTIMAL_COLOR }}
                aria-hidden="true"
              />
              <GlossaryTooltip term="timingOptimal">
                <span
                  className="font-mono text-[10.5px] font-medium tracking-[0.1em]"
                  style={{ color: OPTIMAL_COLOR }}
                >
                  OPTIMAL
                </span>
              </GlossaryTooltip>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">PRIX</div>
            <div className="font-mono text-[14px] font-medium tabular-nums text-zinc-200">
              <AnimatedCounter value={option.expected_price_eur} suffix=" €" decimals={0} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">DÉLAI</div>
            <div
              className="font-mono text-[14px] font-medium tabular-nums"
              style={{ color: delayColor }}
            >
              ~<AnimatedCounter value={option.expected_delay_days} suffix=" j" decimals={0} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
              <GlossaryTooltip term="margeNette"><span>MARGE NETTE</span></GlossaryTooltip>
            </div>
            <div
              className="font-mono text-[14px] font-medium tabular-nums"
              style={{ color: marginColor }}
            >
              <AnimatedCounter
                value={option.net_margin_eur}
                prefix={marginSign}
                suffix=" €"
                decimals={0}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">ACCEPT.</div>
            <div
              className="font-mono text-[14px] font-medium tabular-nums"
              style={{ color: accColor }}
            >
              <AnimatedCounter value={option.acceptance_probability_pct} suffix=" %" decimals={0} />
            </div>
          </div>
        </div>
        <p className="text-[12.5px] text-zinc-400 leading-relaxed">
          {option.narrative}
        </p>
      </div>
    </div>
  );
}

export { EstimatorResaleWhen };
