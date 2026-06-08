import type {
  EstimatorResult,
  Platform,
  PlatformResaleStats,
} from "./datasets";
import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const PLATFORM_BRAND_COLORS: Record<Platform, string> = {
  LBC: "#FF6E14",
  eBay: "#0064D2",
  Vinted: "#09B1BA",
};

const TOP_PICK_COLOR = "#10B981";
const MARGIN_POSITIVE = "#10B981";
const MARGIN_NEGATIVE = "#EF4444";
const DELAY_FAST = "#10B981";
const DELAY_MEDIUM = "#F59E0B";
const DELAY_SLOW = "#EF4444";

type EstimatorResaleWhereProps = {
  result: EstimatorResult;
};

export default function EstimatorResaleWhere({
  result,
}: EstimatorResaleWhereProps) {
  const { resale_where } = result;
  if (!resale_where) return null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 03a
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          OÙ REVENDRE
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {resale_where.platforms.map((p) => (
          <PlatformCard
            key={p.platform}
            platform={p}
            isTopPick={p.is_top_pick}
          />
        ))}
      </div>

      <div className="font-mono text-[10.5px] text-zinc-600 leading-relaxed">
        Marge nette estimée par le marché, frais plateforme déduits — sur la
        base d'un prix d'achat de référence ({resale_where.cost_basis_eur} €).
        Délais estimés à partir de la liquidité catégorie sur 30 j.
      </div>
    </section>
  );
}

function PlatformCard({
  platform,
  isTopPick,
}: {
  platform: PlatformResaleStats;
  isTopPick: boolean;
}) {
  const brandColor = PLATFORM_BRAND_COLORS[platform.platform];
  const marginSign = platform.net_margin_eur >= 0 ? "+" : "";
  const marginColor =
    platform.net_margin_eur >= 0 ? MARGIN_POSITIVE : MARGIN_NEGATIVE;
  const delayDays = platform.expected_delay_days ?? 0;
  const delayColor =
    delayDays <= 7 ? DELAY_FAST : delayDays <= 14 ? DELAY_MEDIUM : DELAY_SLOW;

  return (
    <div
      className={
        "mk-card-flat-soft p-5 flex flex-col gap-4 text-left" +
        (isTopPick ? " best-ring" : "")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: brandColor }}
            aria-hidden="true"
          />
          <span
            className="font-mono text-[10.5px] tracking-[0.2em] truncate"
            style={{ color: "#a1a1aa" }}
          >
            {platform.platform.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
        {platform.data_confidence === "low" && (
          <span
            className="font-mono text-[9.5px] tracking-wider text-zinc-500 border border-white/10 rounded px-1.5 py-0.5"
            title="Marge dérivée d'un proxy, fiabilité réduite"
          >
            DONNÉE ESTIMÉE
          </span>
        )}
        {isTopPick && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: TOP_PICK_COLOR }}
              aria-hidden="true"
            />
            <GlossaryTooltip term="topPick">
              <span
                className="font-mono text-[10.5px] font-medium tracking-[0.1em]"
                style={{ color: TOP_PICK_COLOR }}
              >
                TOP PICK
              </span>
            </GlossaryTooltip>
          </div>
        )}
        </div>
      </div>

      <div className="font-mono text-[10px] text-zinc-600 -mt-2">
        <AnimatedCounter value={platform.estimated_price_eur} suffix=" €" decimals={0} /> brut ·{" "}
        <AnimatedCounter value={platform.fees_pct} suffix=" %" decimals={0} /> frais
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            <GlossaryTooltip term="margeNette"><span>MARGE NETTE</span></GlossaryTooltip>
          </div>
          <div
            className="font-mono text-[15px] font-medium tabular-nums"
            style={{ color: marginColor }}
          >
            <AnimatedCounter
              value={platform.net_margin_eur}
              prefix={marginSign}
              suffix=" €"
              decimals={0}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            DÉLAI
          </div>
          {platform.expected_delay_days == null ||
          platform.est_sell_days_basis === "unavailable" ? (
            <div
              className="font-mono text-[15px] font-medium tabular-nums"
              style={{ color: "#71717a" }}
              title="Pas de donnée de délai pour cette plateforme"
            >
              —
            </div>
          ) : (
            <div
              className="font-mono text-[15px] font-medium tabular-nums"
              style={{ color: delayColor }}
            >
              ~<AnimatedCounter value={delayDays} suffix=" j" decimals={0} />
            </div>
          )}
        </div>
      </div>

      <div
        className="pt-3"
        style={{ borderTop: "1px solid var(--mk-divider-soft)" }}
      >
        <p className="text-[12.5px] text-zinc-400 leading-relaxed">
          {platform.narrative}
        </p>
      </div>
    </div>
  );
}

export { EstimatorResaleWhere };
