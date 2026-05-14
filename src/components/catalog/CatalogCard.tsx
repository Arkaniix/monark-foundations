import {
  Star,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { CatalogModel } from "./datasets";
import {
  MANUFACTURER_DOT_COLOR,
  getLiquidityColor,
  getTrendColor,
} from "./datasets";
import ModelImage from "./ModelImage";
import CatalogScoreChip from "./CatalogScoreChip";
import AnimatedCounter from "../ui/AnimatedCounter";
import AnimatedBar from "../ui/AnimatedBar";

type Props = {
  model: CatalogModel;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenDetails: () => void;
};

/**
 * Card catalogue V1.1 — version mockup pixel-perfect.
 */
export default function CatalogCard({
  model,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
}: Props) {
  const trendColor = getTrendColor(model.trend_30d_pct);
  const liqColor = getLiquidityColor(model.liquidity_pct);
  const brandDot = MANUFACTURER_DOT_COLOR[model.manufacturer];
  const trendSign = model.trend_30d_pct > 0 ? "+" : "";

  const TrendIcon =
    model.trend_30d_pct > 0.5
      ? TrendingUp
      : model.trend_30d_pct < -0.5
        ? TrendingDown
        : Minus;

  return (
    <article
      className="mk-card-flat-soft ease-expo flex flex-col overflow-hidden hover:-translate-y-0.5 hover:bg-white/[0.03]"
      style={{
        transition:
          "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* 1. Image area */}
      <button
        type="button"
        onClick={onOpenDetails}
        className="relative h-[100px] w-full border-b border-white/[0.06] bg-white/[0.015]"
        aria-label={`Ouvrir ${model.name}`}
      >
        <ModelImage category={model.category} url={model.image_url} />
        <div className="absolute left-2 top-2">
          <CatalogScoreChip score={model.score} size="sm" />
        </div>
        <div className="absolute right-2 top-2 rounded border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.16em] text-zinc-400">
          {model.category}
        </div>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        {/* 2. Nom */}
        <h3 className="truncate text-[13.5px] font-medium text-zinc-100" title={model.name}>
          {model.name}
        </h3>

        {/* 3. Badge marque */}
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.12em] text-zinc-500">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: brandDot }}
          />
          <span className="text-zinc-300">{model.manufacturer}</span>
          <span className="text-zinc-700">·</span>
          <span className="truncate">{model.family}</span>
        </div>

        {/* 4. Prix + sparkline + delta */}
        <div className="flex items-end justify-between gap-2">
          <div className="font-mono text-[18px] tabular-nums text-zinc-100">
            <AnimatedCounter value={model.median_eur} suffix=" €" decimals={0} />
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkline
              points={model.sparkline_30d}
              color={trendColor}
              width={40}
              height={12}
            />
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{ color: trendColor }}
            >
              <AnimatedCounter
                value={model.trend_30d_pct}
                prefix={trendSign}
                suffix="%"
                decimals={1}
              />
            </span>
            <TrendIcon className="h-3 w-3" style={{ color: trendColor }} strokeWidth={2} />
          </div>
        </div>

        {/* 5. Label */}
        <div className="font-mono text-[9.5px] tracking-[0.18em] text-zinc-600">
          MÉDIANE 30 J
        </div>

        {/* 6. Bloc liquidité */}
        <div className="flex flex-col gap-1.5 border-t border-white/[0.06] pt-2.5">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em]">
            <span className="text-zinc-600">LIQUIDITÉ</span>
            <span className="tabular-nums" style={{ color: liqColor }}>
              <AnimatedCounter value={model.liquidity_pct} suffix="%" decimals={0} />
            </span>
          </div>
          <AnimatedBar
            percent={Math.max(0, Math.min(100, model.liquidity_pct))}
            color={liqColor}
            height={3}
            rail="rgba(255,255,255,0.05)"
          />
          <div className="flex items-center justify-between font-mono text-[9.5px] tracking-[0.14em] text-zinc-600">
            <span>
              N OBS <span className="ml-1 tabular-nums text-zinc-400">{model.n_obs}</span>
            </span>
            <span>
              FRAÎCHEUR{" "}
              <span className="ml-1 tabular-nums text-zinc-400">{model.freshness_days} j</span>
            </span>
          </div>
        </div>

        {/* 7. Footer actions */}
        <div className="mt-1 flex items-center gap-1.5 border-t border-white/[0.06] pt-2.5">
          <button
            type="button"
            onClick={onOpenDetails}
            className="ease-expo flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10.5px] tracking-[0.16em] text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
          >
            DÉTAILS
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <IconButton
            label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            active={isFavorite}
            activeColor="#F59E0B"
          >
            <Star
              className="h-3.5 w-3.5"
              strokeWidth={1.5}
              fill={isFavorite ? "#F59E0B" : "none"}
            />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

type IconButtonProps = {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  active: boolean;
  activeColor: string;
  children: React.ReactNode;
};

function IconButton({ label, onClick, active, activeColor, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="ease-expo flex h-7 w-7 items-center justify-center rounded-md border bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
      style={{
        borderColor: active ? `${activeColor}66` : "rgba(255,255,255,0.1)",
        color: active ? activeColor : "#a1a1aa",
      }}
    >
      {children}
    </button>
  );
}

function formatPrice(eur: number): string {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(eur) + " €"
  );
}

type SparklineProps = {
  points: number[];
  color: string;
  width: number;
  height: number;
};

function Sparkline({ points, color, width, height }: SparklineProps) {
  if (points.length < 2) return null;
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