import type {
  EstimatorResult,
  Platform,
  PlatformResaleStats,
} from "./datasets";

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
  selectedPlatform: Platform;
  onSelect: (platform: Platform) => void;
};

export default function EstimatorResaleWhere({
  result,
  selectedPlatform,
  onSelect,
}: EstimatorResaleWhereProps) {
  const { resale_where } = result;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 05a
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
            isCurrent={p.platform === selectedPlatform}
            isTopPick={p.is_top_pick}
            onClick={() => onSelect(p.platform)}
          />
        ))}
      </div>

      <div className="font-mono text-[10.5px] text-zinc-600 leading-relaxed">
        Marge nette = prix de revente × (1 − frais) − prix d'achat de référence
        ({resale_where.cost_basis_eur} €). Délais estimés à partir de la
        liquidité catégorie sur 30 j.
      </div>
    </section>
  );
}

function PlatformCard({
  platform,
  isCurrent,
  isTopPick,
  onClick,
}: {
  platform: PlatformResaleStats;
  isCurrent: boolean;
  isTopPick: boolean;
  onClick: () => void;
}) {
  const brandColor = PLATFORM_BRAND_COLORS[platform.platform];
  const marginSign = platform.net_margin_eur >= 0 ? "+" : "";
  const marginColor =
    platform.net_margin_eur >= 0 ? MARGIN_POSITIVE : MARGIN_NEGATIVE;
  const delayColor =
    platform.expected_delay_days <= 7
      ? DELAY_FAST
      : platform.expected_delay_days <= 14
        ? DELAY_MEDIUM
        : DELAY_SLOW;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isCurrent}
      aria-label={`Sélectionner la plateforme ${platform.platform}`}
      className="mk-platform-card-button mk-card-flat-soft p-5 flex flex-col gap-4 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
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
            style={{
              color: isCurrent ? "#d4d4d8" : "#a1a1aa",
              borderBottom: isCurrent ? `1px solid ${brandColor}` : undefined,
              paddingBottom: isCurrent ? 1 : 0,
            }}
          >
            {platform.platform.toUpperCase()}
          </span>
        </div>
        {isTopPick && (
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

      <div className="font-mono text-[10px] text-zinc-600 -mt-2">
        {platform.estimated_price_eur} € brut · {platform.fees_pct} % frais
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            MARGE NETTE
          </div>
          <div
            className="font-mono text-[15px] font-medium tabular-nums"
            style={{ color: marginColor }}
          >
            {marginSign}
            {platform.net_margin_eur} €
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            DÉLAI
          </div>
          <div
            className="font-mono text-[15px] font-medium tabular-nums"
            style={{ color: delayColor }}
          >
            ~{platform.expected_delay_days} j
          </div>
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
    </button>
  );
}

export { EstimatorResaleWhere };
