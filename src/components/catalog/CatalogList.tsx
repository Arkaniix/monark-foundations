import { Star, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CatalogModel } from "./datasets";
import { MANUFACTURER_DOT_COLOR, getLiquidityColor, getTrendColor, hasMarketData } from "./datasets";
import ModelImage from "./ModelImage";
import CatalogScoreChip from "./CatalogScoreChip";
import FadeInSection from "../ui/FadeInSection";

type Props = {
  models: CatalogModel[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (model: CatalogModel) => void;
  gridKey?: string;
};

const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export default function CatalogList({
  models,
  favoriteIds,
  onToggleFavorite,
  onOpenDetails,
  gridKey = "",
}: Props) {
  return (
    <div className="mk-card-flat-soft flex flex-col divide-y divide-white/[0.06] overflow-hidden">
      {models.map((m, i) => (
        <FadeInSection key={`${gridKey}_${m.id}`} delay={Math.min(i, 12) * 20}>
          <CatalogRow
            model={m}
            isFavorite={favoriteIds.includes(m.id)}
            onToggleFavorite={() => onToggleFavorite(m.id)}
            onOpenDetails={() => onOpenDetails(m)}
          />
        </FadeInSection>
      ))}
    </div>
  );
}

type RowProps = {
  model: CatalogModel;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenDetails: () => void;
};

function CatalogRow({ model, isFavorite, onToggleFavorite, onOpenDetails }: RowProps) {
  const trendColor = getTrendColor(model.trend_30d_pct);
  const liqColor = getLiquidityColor(model.liquidity_pct);
  const brandDot = MANUFACTURER_DOT_COLOR[model.manufacturer];
  const trendSign = model.trend_30d_pct > 0 ? "+" : "";
  const TrendIcon =
    model.trend_30d_pct > 0.5 ? TrendingUp : model.trend_30d_pct < -0.5 ? TrendingDown : Minus;

  return (
    <div className="ease-expo flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.025]">
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-white/[0.06] bg-white/[0.015]">
        <ModelImage category={model.category} url={model.image_url} />
      </div>

      <div className="shrink-0">
        {hasMarketData(model) ? (
          <CatalogScoreChip score={model.score} size="sm" />
        ) : (
          <span className="font-mono text-[9px] tracking-[0.14em] text-zinc-700">—</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-zinc-100" title={model.name}>
          {model.name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: brandDot }} />
          <span className="text-zinc-300">{model.manufacturer}</span>
          <span className="text-zinc-700">·</span>
          <span className="truncate">{model.family}</span>
        </div>
      </div>

      {hasMarketData(model) ? (
        <>
          <div className="hidden w-24 flex-col items-end gap-0.5 md:flex">
            <span className="font-mono text-[11px] tabular-nums" style={{ color: liqColor }}>
              {Math.round(model.liquidity_pct)}%
            </span>
            <span className="font-mono text-[9px] tracking-[0.16em] text-zinc-600">LIQUIDITÉ</span>
          </div>

          <div className="hidden w-28 flex-col items-end gap-0.5 lg:flex">
            <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
              VENTES 30 J <span className="ml-1 tabular-nums text-zinc-400">{model.n_obs}</span>
            </span>
            {model.freshness_days != null && (
              <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
                FRAÎCHEUR{" "}
                <span
                  className="ml-1 tabular-nums"
                  style={{ color: model.freshness_days > 7 ? "#F59E0B" : "#a1a1aa" }}
                >
                  {model.freshness_days} j
                </span>
              </span>
            )}
          </div>

          <div className="hidden w-28 items-center justify-end gap-1.5 sm:flex">
            <Sparkline points={model.sparkline_30d} color={trendColor} width={40} height={12} />
            <span className="font-mono text-[11px] tabular-nums" style={{ color: trendColor }}>
              {trendSign}
              {model.trend_30d_pct.toFixed(1)}%
            </span>
            <TrendIcon className="h-3 w-3" style={{ color: trendColor }} strokeWidth={2} />
          </div>

          <div className="w-24 text-right font-mono text-[14px] tabular-nums text-zinc-100">
            {eur.format(model.median_eur)} €
          </div>
        </>
      ) : (
        <div className="ml-auto hidden font-mono text-[10px] tracking-[0.14em] text-zinc-600 sm:block">
          DONNÉES INSUFFISANTES
        </div>
      )}

      <button
        type="button"
        onClick={onOpenDetails}
        className="ease-expo hidden items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-zinc-100 sm:flex"
      >
        DÉTAILS
        <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={isFavorite}
        className="ease-expo flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
        style={{
          borderColor: isFavorite ? "#F59E0B66" : "rgba(255,255,255,0.1)",
          color: isFavorite ? "#F59E0B" : "#a1a1aa",
        }}
      >
        <Star className="h-3.5 w-3.5" strokeWidth={1.5} fill={isFavorite ? "#F59E0B" : "none"} />
      </button>
    </div>
  );
}

type SparklineProps = {
  points: number[] | null;
  color: string;
  width: number;
  height: number;
};

function Sparkline({ points, color, width, height }: SparklineProps) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}