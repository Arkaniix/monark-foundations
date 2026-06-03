import type { CSSProperties } from "react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { Likelihood, SellResult, SellStrategy } from "./datasets";

const TIER_LABEL: Record<SellStrategy["tier"], string> = {
  rapide: "RAPIDE",
  optimal: "OPTIMAL",
  patient: "PATIENT",
};

const OPTIMAL_COLOR = "#10B981";
const DELAY_FAST = "#10B981";
const DELAY_MEDIUM = "#F59E0B";
const DELAY_SLOW = "#EF4444";

const LIKELIHOOD_COLOR: Record<Likelihood, string> = {
  "élevée": "#10B981",
  "modérée": "#F59E0B",
  "faible": "#71717A",
};

type Props = { result: SellResult };

export default function EstimatorSellStrategies({ result }: Props) {
  const hasProfit = typeof result.acquisition_cost === "number";
  const cols = hasProfit
    ? "grid-cols-[110px_100px_100px_90px_100px_1fr]"
    : "grid-cols-[110px_100px_100px_90px_1fr]";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 02
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          STRATÉGIES DE PRIX
        </div>
      </div>

      <div className="mk-card-flat-soft px-5 py-4">
        <div className={`hidden md:grid ${cols} gap-4 pb-3 mb-1 border-b border-white/[0.06]`}>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">STRATÉGIE</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">PRIX VENTE</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">NET</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">DÉLAI</div>
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">FIABILITÉ</div>
          {hasProfit && (
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">PROFIT</div>
          )}
        </div>

        {result.strategies.map((s, idx) => (
          <StrategyRow
            key={s.tier}
            strategy={s}
            hasTopBorder={idx > 0}
            hasProfit={hasProfit}
            cols={cols}
          />
        ))}
      </div>

      <div className="font-mono text-[10.5px] text-zinc-600 leading-relaxed">
        Prix ancrés sur les ventes réelles (sold). Délais et fiabilité estimés.
      </div>
    </section>
  );
}

function StrategyRow({
  strategy,
  hasTopBorder,
  hasProfit,
  cols,
}: {
  strategy: SellStrategy;
  hasTopBorder: boolean;
  hasProfit: boolean;
  cols: string;
}) {
  const isOptimal = strategy.tier === "optimal";
  const delayColor =
    strategy.est_days <= 7
      ? DELAY_FAST
      : strategy.est_days <= 21
        ? DELAY_MEDIUM
        : DELAY_SLOW;
  const lkColor = LIKELIHOOD_COLOR[strategy.likelihood];
  const baseBg = isOptimal ? "rgba(255,255,255,0.018)" : "transparent";
  const hoverBg = isOptimal
    ? "rgba(255,255,255,0.038)"
    : "rgba(255,255,255,0.025)";
  const rowStyle: CSSProperties = {
    backgroundColor: baseBg,
    borderTop: hasTopBorder ? "0.5px solid var(--mk-divider-soft)" : undefined,
    ...({ "--mk-row-hover-bg": hoverBg } as CSSProperties),
  };

  const profit = strategy.profit_eur ?? 0;
  const profitColor = profit >= 0 ? "#10B981" : "#EF4444";

  return (
    <div className="mk-timing-row -mx-5 px-5" style={rowStyle}>
      <div className={`hidden md:grid ${cols} gap-4 items-center py-3.5`}>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[11px] tracking-[0.2em] font-medium"
            style={{ color: isOptimal ? "#e4e4e7" : "#a1a1aa" }}
          >
            {TIER_LABEL[strategy.tier]}
          </span>
          {isOptimal && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: OPTIMAL_COLOR }}
              aria-label="Recommandé"
            />
          )}
        </div>
        <div className="font-mono text-[14px] font-medium tabular-nums text-zinc-200">
          <AnimatedCounter value={strategy.listing_price} suffix=" €" decimals={0} />
        </div>
        <div className="font-mono text-[14px] font-medium tabular-nums text-zinc-300">
          <AnimatedCounter value={strategy.net_price} suffix=" €" decimals={0} />
        </div>
        <div className="font-mono text-[14px] font-medium tabular-nums" style={{ color: delayColor }}>
          ~<AnimatedCounter value={strategy.est_days} suffix=" j" decimals={0} />
        </div>
        <div>
          <span
            className="px-1.5 py-0.5 rounded font-mono text-[10.5px] tracking-wider border"
            style={{
              color: lkColor,
              borderColor: `${lkColor}55`,
              background: `${lkColor}12`,
            }}
          >
            {strategy.likelihood.toUpperCase()}
          </span>
        </div>
        {hasProfit && (
          <div
            className="font-mono text-[14px] font-medium tabular-nums"
            style={{ color: profitColor }}
          >
            {profit >= 0 ? "+" : ""}
            <AnimatedCounter value={profit} suffix=" €" decimals={0} />
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[11px] tracking-[0.2em] font-medium"
            style={{ color: isOptimal ? "#e4e4e7" : "#a1a1aa" }}
          >
            {TIER_LABEL[strategy.tier]}
          </span>
          {isOptimal && (
            <span
              className="font-mono text-[10.5px] font-medium tracking-[0.1em]"
              style={{ color: OPTIMAL_COLOR }}
            >
              RECOMMANDÉ
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          <Cell label="PRIX VENTE" value={`${strategy.listing_price} €`} />
          <Cell label="NET" value={`${strategy.net_price} €`} />
          <Cell label="DÉLAI" value={`~${strategy.est_days} j`} color={delayColor} />
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">FIABILITÉ</div>
            <span
              className="self-start px-1.5 py-0.5 rounded font-mono text-[10.5px] tracking-wider border"
              style={{
                color: lkColor,
                borderColor: `${lkColor}55`,
                background: `${lkColor}12`,
              }}
            >
              {strategy.likelihood.toUpperCase()}
            </span>
          </div>
          {hasProfit && (
            <Cell
              label="PROFIT"
              value={`${profit >= 0 ? "+" : ""}${profit} €`}
              color={profitColor}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
        {label}
      </div>
      <div
        className="font-mono text-[14px] font-medium tabular-nums"
        style={{ color: color ?? "#d4d4d8" }}
      >
        {value}
      </div>
    </div>
  );
}

export { EstimatorSellStrategies };