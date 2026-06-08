import { PercentileChart, Sparkline } from "@/components/ui";
import { MarketStatCard, type MarketStatusTone } from "./MarketStatCard";
import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { VERDICT_COLORS, type EstimatorResult } from "./datasets";

const POSITIONING_BASIS_LABEL: Record<string, string> = {
  sold: "sur les ventes récentes (90 j)",
  sold_widened: "sur ventes élargies (180 j)",
  mixed_fallback: "estimation sur échantillon élargi",
};

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

  const trendTone: MarketStatusTone =
    trend.status === "Indéterminée"
      ? "muted"
      : trend.delta_30d_pct >= 2
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

  const valueVsNewTone: MarketStatusTone =
    value_vs_new.status === "Indisponible" || value_vs_new.decote_pct == null
      ? "muted"
      : value_vs_new.decote_pct > 0
        ? "positive"
        : "negative";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 04
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          POSITIONNEMENT MARCHÉ
        </div>
      </div>

      {result.positioning_basis &&
        POSITIONING_BASIS_LABEL[result.positioning_basis] && (
          <div className="font-mono text-[10px] tracking-wider text-zinc-600 -mt-2">
            Positionnement basé{" "}
            {POSITIONING_BASIS_LABEL[result.positioning_basis]}.
          </div>
        )}

      {value_vs_new.shortage_signal && (
        <div
          className="-mt-2 inline-flex items-center gap-1.5 self-start rounded border px-2 py-1 font-mono text-[9.5px] tracking-wider"
          style={{ color: "#F59E0B", borderColor: "rgba(245,158,11,0.3)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#F59E0B" }}
            aria-hidden="true"
          />
          PÉNURIE · OCCASION ≥ NEUF
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="mk-card-flat-soft lg:col-span-3 p-5">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-4">
            POSITIONNEMENT PRIX
          </div>
          <PercentileChart
            distribution={result.percentile_distribution}
            askPrice={result.inputs.ask_price_eur}
            color={verdictColor}
            observationsLabel={`${result.data_quality.observations_count} obs`}
            percentilePosition={result.percentile_position_pct}
            histogram={result.sold_histogram}
            chartHint="Densité réelle des ventes sold — chaque barre = nombre de transactions dans cette tranche de prix. Les queues révèlent deals et prix au-dessus du marché."
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
            {result.price_history_30d.length >= 2 ? (
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
            ) : (
              <div className="w-full text-center font-mono text-[10.5px] text-zinc-600">
                Données sold insuffisantes sur 30 j
              </div>
            )}
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
          {result.price_history_30d.length >= 2 && (
            <p className="mt-3 font-mono text-[9px] leading-relaxed text-zinc-600">
              Médiane sold réelle — la courbe s'arrête au dernier relevé (le sold a un délai naturel).
            </p>
          )}
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
              value:
                value_vs_new.decote_pct == null
                  ? "—"
                  : `${value_vs_new.decote_pct.toFixed(0)} %`,
              tone:
                value_vs_new.decote_pct == null
                  ? "neutral"
                  : value_vs_new.decote_pct <= -20
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
