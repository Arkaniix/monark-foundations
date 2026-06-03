import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { Likelihood, SellResult } from "./datasets";

const LIKELIHOOD_COLOR: Record<Likelihood, string> = {
  "élevée": "#10B981",
  "modérée": "#F59E0B",
  "faible": "#71717A",
};

type Props = { result: SellResult };

export default function EstimatorSellRecommendation({ result }: Props) {
  const r = result.recommended;
  const lk = LIKELIHOOD_COLOR[r.likelihood];
  const hasProfit = typeof r.profit_eur === "number";
  const profitColor =
    (r.profit_eur ?? 0) >= 0 ? "#10B981" : "#EF4444";

  return (
    <div className="mk-card p-6 fade-up flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          RECOMMANDATION VENTE
        </div>
        <div className="font-mono text-[10px] tracking-wider text-zinc-600">
          {result.model_name} · {result.category}
        </div>
      </div>

      <div className="flex flex-col items-center text-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          LISTE À
        </div>
        <div
          className="text-[40px] font-semibold tabular-nums tracking-tight font-mono"
          style={{ color: "#10B981" }}
        >
          <AnimatedCounter value={r.listing_price} suffix=" €" decimals={0} />
        </div>

        <div className="text-[13px] text-zinc-400 flex items-center gap-2 flex-wrap justify-center">
          <span>
            vendu en ~
            <span className="font-mono text-zinc-200">
              <AnimatedCounter value={r.est_days} decimals={0} />
            </span>{" "}
            j · tu reçois{" "}
            <span className="font-mono text-zinc-200">
              <AnimatedCounter value={r.net_price} suffix=" €" decimals={0} />
            </span>{" "}
            net
          </span>
          <span
            className="px-1.5 py-0.5 rounded font-mono text-[10.5px] tracking-wider border"
            style={{
              color: lk,
              borderColor: `${lk}55`,
              background: `${lk}12`,
            }}
          >
            {r.likelihood.toUpperCase()}
          </span>
        </div>

        {hasProfit && (
          <div className="text-[13.5px]">
            Profit estimé{" "}
            <span
              className="font-mono font-medium"
              style={{ color: profitColor }}
            >
              {(r.profit_eur ?? 0) >= 0 ? "+" : ""}
              <AnimatedCounter
                value={r.profit_eur ?? 0}
                suffix=" €"
                decimals={0}
              />
            </span>
            {typeof r.profit_pct === "number" && (
              <span className="text-zinc-500">
                {" "}
                ({(r.profit_pct ?? 0) >= 0 ? "+" : ""}
                <AnimatedCounter
                  value={r.profit_pct ?? 0}
                  suffix=" %"
                  decimals={0}
                />
                )
              </span>
            )}
          </div>
        )}
      </div>

      <div className="font-mono text-[10.5px] text-zinc-600 leading-relaxed text-center pt-4 border-t border-white/5">
        Médiane sold{" "}
        <span className="text-zinc-400">
          <AnimatedCounter value={result.median_eur} suffix=" €" decimals={0} />
        </span>{" "}
        · {result.trend_narrative}
      </div>
    </div>
  );
}

export { EstimatorSellRecommendation };