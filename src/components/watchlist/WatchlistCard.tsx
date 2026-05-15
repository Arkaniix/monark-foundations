import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CatalogModel } from "../catalog/datasets";
import {
  MANUFACTURER_DOT_COLOR,
  getTrendColor,
  getLiquidityColor,
} from "../catalog/datasets";
import ModelImage from "../catalog/ModelImage";
import CatalogScoreChip from "../catalog/CatalogScoreChip";
import { Sparkline } from "../ui/Sparkline";
import {
  type FavoriteEntry,
  type MovementDelta,
} from "@/lib/catalogFavorites";

type Props = {
  model: CatalogModel;
  entry: FavoriteEntry | null;
  delta: MovementDelta | null;
  onToggleFavorite: () => void;
  onSelect: () => void;
};

export default function WatchlistCard({
  model,
  entry,
  delta,
  onToggleFavorite,
  onSelect,
}: Props) {
  const isSignificant = delta?.isSignificant ?? false;
  const isDrop = isSignificant && delta?.direction === "down";
  const isUp = isSignificant && delta?.direction === "up";

  const cardBorderColor = isDrop
    ? "rgba(239,68,68,0.27)"
    : isUp
      ? "rgba(16,185,129,0.27)"
      : "#27272A";
  const accent = isDrop ? "#EF4444" : isUp ? "#10B981" : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="mk-card-flat-soft ease-expo relative flex h-[196px] cursor-pointer overflow-hidden transition-colors hover:bg-white/[0.012]"
      style={{ borderColor: cardBorderColor }}
    >
      {accent && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: accent }}
        />
      )}

      <div
        className="flex h-full w-[184px] shrink-0 items-center justify-center overflow-hidden border-r border-white/[0.06]"
        style={{ background: "#0B0B0D" }}
      >
        <ModelImage category={model.category} url={model.image_url} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[17px] text-zinc-100" title={model.name}>
                {model.name}
              </span>
              {isDrop && (
                <span
                  className="shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em]"
                  style={{
                    background: "rgba(239,68,68,0.13)",
                    borderColor: "rgba(239,68,68,0.4)",
                    color: "#EF4444",
                  }}
                >
                  ▼ DROP {delta!.pct.toFixed(1)}%
                </span>
              )}
              {isUp && (
                <span
                  className="shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em]"
                  style={{
                    background: "rgba(16,185,129,0.13)",
                    borderColor: "rgba(16,185,129,0.4)",
                    color: "#10B981",
                  }}
                >
                  ▲ UP +{delta!.pct.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.12em] text-zinc-500">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: MANUFACTURER_DOT_COLOR[model.manufacturer] }}
              />
              <span className="text-zinc-300">{model.manufacturer}</span>
              <span className="text-zinc-700">·</span>
              <span className="truncate">{model.family}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CatalogScoreChip score={model.score} size="md" />
            <button
              type="button"
              aria-label="Retirer des favoris"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="ease-expo flex h-[26px] w-[26px] items-center justify-center rounded-md border bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
              style={{
                borderColor: "rgba(245,158,11,0.4)",
                color: "#F59E0B",
              }}
            >
              <Star className="h-3.5 w-3.5" strokeWidth={1.5} fill="#F59E0B" />
            </button>
          </div>
        </div>

        <div className="my-3 h-px bg-white/[0.04]" />

        <div className="grid grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">MÉDIANE</span>
            <span className="font-mono text-[20px] tabular-nums text-zinc-100">
              {Math.round(model.median_eur).toLocaleString("fr-FR")} €
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">DEPUIS PIN</span>
            {delta === null ? (
              <span className="font-mono text-[18px] text-zinc-600">—</span>
            ) : (
              <>
                <span
                  className="font-mono text-[18px] tabular-nums"
                  style={{
                    color: isSignificant
                      ? delta.direction === "down"
                        ? "#EF4444"
                        : "#10B981"
                      : "#A1A1AA",
                  }}
                >
                  {delta.pct >= 0 ? "+" : ""}
                  {delta.pct.toFixed(1)}%
                </span>
                {entry && entry.snapshot_eur !== null && (
                  <span className="font-mono text-[9px] tracking-[0.1em] text-zinc-700">
                    vs {Math.round(entry.snapshot_eur).toLocaleString("fr-FR")} €
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">TENDANCE 30J</span>
            <Sparkline
              points={model.sparkline_30d}
              color={getTrendColor(model.trend_30d_pct)}
              w={80}
              h={20}
            />
            <div className="flex items-center gap-1">
              <span
                className="font-mono text-[12px] tabular-nums"
                style={{ color: getTrendColor(model.trend_30d_pct) }}
              >
                {model.trend_30d_pct > 0 ? "+" : ""}
                {model.trend_30d_pct.toFixed(1)}%
              </span>
              <TrendArrow pct={model.trend_30d_pct} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">LIQUIDITÉ</span>
            <span
              className="font-mono text-[18px] tabular-nums"
              style={{ color: getLiquidityColor(model.liquidity_pct) }}
            >
              {Math.round(model.liquidity_pct)}%
            </span>
            <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, model.liquidity_pct))}%`,
                  background: getLiquidityColor(model.liquidity_pct),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendArrow({ pct }: { pct: number }) {
  const Icon = pct > 0.5 ? TrendingUp : pct < -0.5 ? TrendingDown : Minus;
  return (
    <Icon
      className="h-3 w-3"
      style={{ color: getTrendColor(pct) }}
      strokeWidth={2}
    />
  );
}
