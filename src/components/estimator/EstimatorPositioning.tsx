import { PercentileChart, Sparkline } from "@/components/ui";
import { MarketStatCard } from "./MarketStatCard";
import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { VERDICT_COLORS, type EstimatorResult } from "./datasets";

type EstimatorPositioningProps = {
  result: EstimatorResult;
};

/**
 * Section §02 — Positionnement marché.
 */
export default function EstimatorPositioning({
  result,
}: EstimatorPositioningProps) {
  const verdictColor = VERDICT_COLORS[result.verdict];
  const { trend, liquidity, value_vs_new } = result.category_market_stats;
  const position = result.percentile_position_pct;

  const trendTone: "positive" | "neutral" | "negative" =
    trend.delta_30d_pct >= 2
      ? "positive"
      : trend.delta_30d_pct <= -2
        ? "negative"
        : "neutral";

  const liquidityTone: "positive" | "neutral" | "negative" =
    liquidity.status === "Élevée"
      ? "positive"
      : liquidity.status === "Modérée"
        ? "neutral"
        : "negative";

  const valueVsNewTone: "positive" | "neutral" | "negative" =
    value_vs_new.status === "Forte"
      ? "positive"
      : value_vs_new.status === "Modérée"
        ? "neutral"
        : "negative";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 02
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          POSITIONNEMENT MARCHÉ
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="mk-card-flat-soft lg:col-span-3 p-5">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-4">
            POSITIONNEMENT PRIX
          </div>
          <PercentileChart
            distribution={result.percentile_distribution}
            askPrice={result.inputs.ask_price_eur}
            color={verdictColor}
            observationsLabel={`${result.data_quality.observations_count} obs · 180 j`}
            percentilePosition={result.percentile_position_pct}
          />
          <p className="text-[13px] text-zinc-300 mt-4 leading-relaxed">
            Votre prix de{" "}
            <span className="font-mono font-medium text-zinc-100">
              <AnimatedCounter value={result.inputs.ask_price_eur} suffix=" €" decimals={0} />
            </span>{" "}
            est{" "}
            {position < 40 ? (
              <>
                <span className="font-mono" style={{ color: verdictColor }}>
                  moins cher que <AnimatedCounter value={100 - position} suffix=" %" decimals={0} />
                </span>{" "}
                du marché.
              </>
            ) : position > 60 ? (
              <>
                <span className="font-mono" style={{ color: verdictColor }}>
                  plus cher que <AnimatedCounter value={position} suffix=" %" decimals={0} />
                </span>{" "}
                du marché.
              </>
            ) : (
              <>
                <span className="font-mono" style={{ color: verdictColor }}>
                  dans la zone médiane
                </span>{" "}
                du marché (P25 → P75).
              </>
            )}
          </p>
        </div>

        <div className="mk-card-flat-soft lg:col-span-2 p-5 flex flex-col">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-4">
            HISTORIQUE 30 J · MÉDIANE SOLD
          </div>
          <div className="flex-1 flex items-center" style={{ minHeight: 90 }}>
            <div className="w-full" style={{ aspectRatio: "4 / 1" }}>
              <Sparkline
                points={result.price_history_30d}
                color="#3B82F6"
                fillHeight
                fill
                animate
                hover
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <div className="font-mono text-[9.5px] tracking-wider text-zinc-600 mb-0.5">
                MÉDIANE
              </div>
              <div className="font-mono text-[14px] text-zinc-100">
                <AnimatedCounter value={result.percentile_distribution.p50} suffix=" €" decimals={0} />
              </div>
            </div>
            <div>
              <div className="font-mono text-[9.5px] tracking-wider text-zinc-600 mb-0.5">
                7 J
              </div>
              <div
                className="font-mono text-[14px]"
                style={{
                  color: trend.delta_7d_pct >= 0 ? "#10B981" : "#EF4444",
                }}
              >
                <AnimatedCounter
                  value={trend.delta_7d_pct}
                  prefix={trend.delta_7d_pct >= 0 ? "+" : ""}
                  suffix=" %"
                  decimals={1}
                />
              </div>
            </div>
            <div>
              <div className="font-mono text-[9.5px] tracking-wider text-zinc-600 mb-0.5">
                30 J
              </div>
              <div
                className="font-mono text-[14px]"
                style={{
                  color: trend.delta_30d_pct >= 0 ? "#10B981" : "#EF4444",
                }}
              >
                <AnimatedCounter
                  value={trend.delta_30d_pct}
                  prefix={trend.delta_30d_pct >= 0 ? "+" : ""}
                  suffix=" %"
                  decimals={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MarketStatCard
          label="TENDANCE"
          termKey="trend30d"
          status={trend.status}
          statusTone={trendTone}
          datapoints={[
            {
              label: "7 J",
              value: `${trend.delta_7d_pct >= 0 ? "+" : ""}${trend.delta_7d_pct.toFixed(1)} %`,
              tone: trend.delta_7d_pct >= 0 ? "positive" : "negative",
            },
            {
              label: "30 J",
              value: `${trend.delta_30d_pct >= 0 ? "+" : ""}${trend.delta_30d_pct.toFixed(1)} %`,
              tone: trend.delta_30d_pct >= 0 ? "positive" : "negative",
            },
          ]}
          narrative={trend.narrative}
        />

        <MarketStatCard
          label="LIQUIDITÉ"
          termKey="liquidity"
          status={liquidity.status}
          statusTone={liquidityTone}
          datapoints={[
            { label: "VENTES / 30 J", value: `${liquidity.sales_30d}` },
            { label: "ANNONCES", value: `${liquidity.active_listings}` },
          ]}
          narrative={liquidity.narrative}
        />

        <MarketStatCard
          label="DÉCOTE VS NEUF"
          termKey="decoteVsNeuf"
          status={value_vs_new.status}
          statusTone={valueVsNewTone}
          datapoints={[
            {
              label: "DÉCOTE",
              value: `${value_vs_new.decote_pct.toFixed(0)} %`,
              tone:
                value_vs_new.decote_pct <= -20
                  ? "positive"
                  : value_vs_new.decote_pct <= -10
                    ? "neutral"
                    : "negative",
            },
            { label: "ÉTAT", value: result.inputs.state },
          ]}
          narrative={value_vs_new.narrative}
        />
      </div>
    </section>
  );
}

export { EstimatorPositioning };
