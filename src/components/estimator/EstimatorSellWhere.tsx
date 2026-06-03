import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { Platform, SellPlatform, SellResult } from "./datasets";

const PLATFORM_BRAND_COLORS: Record<Platform, string> = {
  LBC: "#FF6E14",
  eBay: "#0064D2",
  Vinted: "#09B1BA",
};

const TOP_PICK_COLOR = "#10B981";
const DELAY_FAST = "#10B981";
const DELAY_MEDIUM = "#F59E0B";
const DELAY_SLOW = "#EF4444";
const MARGIN_POSITIVE = "#10B981";
const MARGIN_NEGATIVE = "#EF4444";

type Props = { result: SellResult };

export default function EstimatorSellWhere({ result }: Props) {
  const hasProfit = typeof result.acquisition_cost === "number";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 03
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          OÙ LISTER
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.platforms.map((p) => (
          <PlatformCard key={p.platform} platform={p} hasProfit={hasProfit} />
        ))}
      </div>

      <div className="font-mono text-[10.5px] text-zinc-600 leading-relaxed">
        Net après frais plateforme. Leboncoin et eBay uniquement (Vinted exclu
        des recommandations de revente).
      </div>
    </section>
  );
}

function PlatformCard({
  platform,
  hasProfit,
}: {
  platform: SellPlatform;
  hasProfit: boolean;
}) {
  const brandColor = PLATFORM_BRAND_COLORS[platform.platform];
  const delayColor =
    platform.est_sell_days <= 7
      ? DELAY_FAST
      : platform.est_sell_days <= 14
        ? DELAY_MEDIUM
        : DELAY_SLOW;
  const margin = platform.net_margin_eur ?? 0;
  const marginColor = margin >= 0 ? MARGIN_POSITIVE : MARGIN_NEGATIVE;
  const marginSign = margin >= 0 ? "+" : "";

  return (
    <div className="mk-card-flat-soft p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: brandColor }}
            aria-hidden="true"
          />
          <span
            className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-300 truncate"
          >
            {platform.platform.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {platform.data_confidence === "low" && (
            <span
              className="font-mono text-[9.5px] tracking-wider text-zinc-500 border border-white/10 rounded px-1.5 py-0.5"
              title="Donnée estimée — fiabilité réduite"
            >
              DONNÉE ESTIMÉE
            </span>
          )}
          {platform.is_recommended && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: TOP_PICK_COLOR }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-[10.5px] font-medium tracking-[0.1em]"
                style={{ color: TOP_PICK_COLOR }}
              >
                TOP PICK
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="font-mono text-[10px] text-zinc-600 -mt-2">
        <AnimatedCounter value={platform.seller_net_price} suffix=" €" decimals={0} /> net ·{" "}
        <AnimatedCounter value={platform.fees_pct} suffix=" %" decimals={0} /> frais
      </div>

      <div className={`grid ${hasProfit ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">NET</div>
          <div className="font-mono text-[15px] font-medium tabular-nums text-zinc-200">
            <AnimatedCounter value={platform.seller_net_price} suffix=" €" decimals={0} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">DÉLAI</div>
          <div
            className="font-mono text-[15px] font-medium tabular-nums"
            style={{ color: delayColor }}
          >
            ~<AnimatedCounter value={platform.est_sell_days} suffix=" j" decimals={0} />
          </div>
        </div>
        {hasProfit && (
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">PROFIT</div>
            <div
              className="font-mono text-[15px] font-medium tabular-nums"
              style={{ color: marginColor }}
            >
              {marginSign}
              <AnimatedCounter value={margin} suffix=" €" decimals={0} />
            </div>
          </div>
        )}
      </div>

      {platform.narrative && (
        <div
          className="pt-3"
          style={{ borderTop: "1px solid var(--mk-divider-soft)" }}
        >
          <p className="text-[12.5px] text-zinc-400 leading-relaxed">
            {platform.narrative}
          </p>
        </div>
      )}
    </div>
  );
}

export { EstimatorSellWhere };