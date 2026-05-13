import { getScoreColor, type EstimatorResult, type Platform } from "./datasets";
import type { PlatformResaleStats } from "./datasets";

type EstimatorResaleWhereProps = {
  result: EstimatorResult;
};

const ACCENT = "#3B82F6";

const PLATFORM_BRAND_COLORS: Record<Platform, string> = {
  LBC: "#FF6E14",
  eBay: "#E53238",
  Vinted: "#09B1BA",
  Particulier: "#71717a",
};

export default function EstimatorResaleWhere({
  result,
}: EstimatorResaleWhereProps) {
  const { resale_where } = result;
  const topPick = resale_where.platforms.find((p) => p.is_top_pick);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {resale_where.platforms.map((p) => (
          <PlatformCard key={p.platform} platform={p} />
        ))}
      </div>

      {topPick && (
        <div
          className="px-4 py-3 rounded"
          style={{
            background: "rgba(59,130,246,0.05)",
            borderLeft: `2px solid ${ACCENT}`,
          }}
        >
          <div
            className="font-mono text-[9.5px] tracking-[0.2em] mb-1.5"
            style={{ color: ACCENT }}
          >
            ★ PLATEFORME OPTIMALE — {topPick.platform}
          </div>
          <div className="text-[13px] text-zinc-300 leading-relaxed">
            {resale_where.top_pick_narrative}
          </div>
        </div>
      )}

      <div className="text-[10.5px] text-zinc-600 leading-relaxed">
        Marge nette = prix de revente × (1 − frais) − prix d'achat de référence
        ({result.inputs.ask_price_eur} €). Délais estimés à partir de la
        liquidité catégorie sur 30 j.
      </div>
    </section>
  );
}

function PlatformCard({ platform }: { platform: PlatformResaleStats }) {
  const brandColor = PLATFORM_BRAND_COLORS[platform.platform];
  const isTop = platform.is_top_pick;
  const scoreColor = getScoreColor(platform.recommendation_score);
  const marginSign = platform.net_margin_eur >= 0 ? "+" : "";
  const marginColor =
    platform.net_margin_eur >= 0 ? "#10B981" : "#EF4444";

  return (
    <div
      className="rounded-lg overflow-hidden relative flex flex-col"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: isTop
          ? `1.5px solid ${ACCENT}`
          : "0.5px solid var(--mk-divider-soft)",
        padding: "14px",
        paddingTop: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: brandColor,
        }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: brandColor }}
            aria-hidden="true"
          />
          <span className="text-[13px] font-medium text-zinc-100 truncate">
            {platform.platform}
          </span>
        </div>
        {isTop && (
          <span
            className="font-mono text-[12px] flex-shrink-0"
            style={{ color: ACCENT }}
            aria-label="Plateforme recommandée"
          >
            ★
          </span>
        )}
      </div>

      <div
        className="font-mono text-[24px] font-medium tracking-tight text-zinc-100"
        style={{ lineHeight: 1 }}
      >
        {platform.estimated_price_eur} €
      </div>

      <div className="font-mono text-[11px] mt-1.5">
        <span style={{ color: marginColor }}>
          {marginSign}
          {platform.net_margin_eur} €
        </span>
        <span className="text-zinc-600"> · {platform.fees_pct} %</span>
      </div>

      <div className="font-mono text-[11px] text-zinc-500 mt-0.5">
        ~{platform.expected_delay_days} j
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div
          className="flex-1 h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full"
            style={{
              width: `${platform.recommendation_score}%`,
              background: scoreColor,
              transition: "width 800ms cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
        <span
          className="font-mono text-[10px] font-medium"
          style={{ color: scoreColor }}
        >
          {platform.recommendation_score}
        </span>
      </div>
    </div>
  );
}

export { EstimatorResaleWhere };
