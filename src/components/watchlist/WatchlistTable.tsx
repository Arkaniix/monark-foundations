import {
  Star,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { CatalogModel } from "../catalog/datasets";
import {
  MANUFACTURER_DOT_COLOR,
  getTrendColor,
  getLiquidityColor,
  getMarginColor,
} from "../catalog/datasets";
import ModelImage from "../catalog/ModelImage";
import CatalogScoreChip from "../catalog/CatalogScoreChip";
import AnimatedCounter from "../ui/AnimatedCounter";
import { Sparkline } from "../ui/Sparkline";
import {
  type FavoriteEntry,
  type MovementDelta,
  computeMovementDelta,
} from "@/lib/catalogFavorites";
import { formatRelativeShort } from "./datasets";

type Props = {
  models: CatalogModel[];
  favoriteEntries: FavoriteEntry[];
  onToggleFavorite: (id: string, currentMedian: number) => void;
  onSelectRow: (model: CatalogModel) => void;
};

export default function WatchlistTable({
  models,
  favoriteEntries,
  onToggleFavorite,
  onSelectRow,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="mk-card-flat-soft overflow-hidden">
      <TableHeader />
      <div className="divide-y divide-white/[0.03]">
        {models.map((m) => {
          const entry = favoriteEntries.find((e) => e.id === m.id) ?? null;
          const delta = computeMovementDelta(entry, m.median_eur);
          return (
            <TableRow
              key={m.id}
              model={m}
              entry={entry}
              delta={delta}
              onToggleFavorite={() => onToggleFavorite(m.id, m.median_eur)}
              onSelect={() => onSelectRow(m)}
              onOpenFiche={() =>
                navigate({
                  to: "/catalogue/$modelId",
                  params: { modelId: m.id },
                })
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function TableHeader() {
  const columns = [
    { key: "model", label: "MODÈLE", width: "flex-1 min-w-[280px]" },
    { key: "score", label: "SCORE", width: "w-[56px]" },
    { key: "median", label: "MÉDIANE", width: "w-[90px]" },
    { key: "snap", label: "DEPUIS PIN", width: "w-[100px]" },
    { key: "delta", label: "Δ", width: "w-[80px]" },
    { key: "trend", label: "TENDANCE 30J", width: "w-[136px]" },
    { key: "liq", label: "LIQUIDITÉ", width: "w-[116px]" },
    { key: "margin", label: "MARGE", width: "w-[64px]" },
    { key: "actions", label: "ACTIONS", width: "w-[76px]" },
  ];

  return (
    <div
      className="flex h-9 items-center gap-3 border-b border-white/[0.06] px-4"
      style={{ background: "var(--mk-surface-1)" }}
    >
      {columns.map((col) => (
        <div
          key={col.key}
          className={`${col.width} font-mono text-[10px] tracking-[0.14em] text-zinc-600`}
        >
          {col.label}
        </div>
      ))}
    </div>
  );
}

type RowProps = {
  model: CatalogModel;
  entry: FavoriteEntry | null;
  delta: MovementDelta | null;
  onToggleFavorite: () => void;
  onSelect: () => void;
  onOpenFiche: () => void;
};

function TableRow({
  model,
  entry,
  delta,
  onToggleFavorite,
  onSelect,
  onOpenFiche,
}: RowProps) {
  const isSignificant = delta?.isSignificant ?? false;
  const isDrop = isSignificant && delta?.direction === "down";
  const isUp = isSignificant && delta?.direction === "up";

  const rowBg = isDrop
    ? "rgba(239,68,68,0.06)"
    : isUp
      ? "rgba(16,185,129,0.06)"
      : "transparent";
  const rowAccent = isDrop ? "#EF4444" : isUp ? "#10B981" : "transparent";

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
      className="ease-expo relative flex h-[60px] cursor-pointer items-center gap-3 px-4 transition-colors hover:bg-white/[0.025]"
      style={{ background: rowBg }}
    >
      {rowAccent !== "transparent" && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: rowAccent }}
        />
      )}

      <div className="flex min-w-[280px] flex-1 items-center gap-3">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded border border-white/[0.06] bg-white/[0.015]">
          <ModelImage category={model.category} url={model.image_url} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="truncate text-[13px] text-zinc-100"
              title={model.name}
            >
              {model.name}
            </span>
            {isDrop && (
              <span
                className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em]"
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
                className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em]"
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
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-zinc-500">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: MANUFACTURER_DOT_COLOR[model.manufacturer] }}
            />
            <span className="text-zinc-300">{model.manufacturer}</span>
            <span className="text-zinc-700">·</span>
            <span className="truncate">{model.family}</span>
          </div>
        </div>
      </div>

      <div className="w-[56px]">
        <CatalogScoreChip score={model.score} size="sm" />
      </div>

      <div className="w-[90px] font-mono text-[13px] tabular-nums text-zinc-100">
        <AnimatedCounter value={model.median_eur} suffix=" €" decimals={0} />
      </div>

      <div className="flex w-[100px] flex-col gap-0.5">
        <span className="font-mono text-[12px] tabular-nums text-zinc-500">
          {entry && entry.snapshot_eur !== null
            ? `${Math.round(entry.snapshot_eur).toLocaleString("fr-FR")} €`
            : "—"}
        </span>
        <span className="font-mono text-[9px] tracking-[0.1em] text-zinc-700">
          {entry ? formatRelativeShort(entry.snapshot_at) : ""}
        </span>
      </div>

      <div className="w-[80px]">
        {delta === null ? (
          <span className="font-mono text-[12px] text-zinc-600">—</span>
        ) : (
          <span
            className="font-mono text-[13px] font-medium tabular-nums"
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
        )}
      </div>

      <div className="flex w-[136px] items-center gap-1.5">
        <Sparkline
          points={model.sparkline_30d}
          color={getTrendColor(model.trend_30d_pct)}
          w={48}
          h={14}
        />
        <span
          className="font-mono text-[11.5px] tabular-nums"
          style={{ color: getTrendColor(model.trend_30d_pct) }}
        >
          {model.trend_30d_pct > 0 ? "+" : ""}
          {model.trend_30d_pct.toFixed(1)}%
        </span>
        <TrendArrow pct={model.trend_30d_pct} />
      </div>

      <div className="flex w-[116px] items-center gap-2">
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, model.liquidity_pct))}%`,
              background: getLiquidityColor(model.liquidity_pct),
            }}
          />
        </div>
        <span
          className="font-mono text-[11.5px] tabular-nums"
          style={{ color: getLiquidityColor(model.liquidity_pct) }}
        >
          {Math.round(model.liquidity_pct)}%
        </span>
      </div>

      <div
        className="w-[64px] font-mono text-[12px] tabular-nums"
        style={{ color: getMarginColor(model.margin_pct) }}
      >
        {Math.round(model.margin_pct)}%
      </div>

      <div className="flex w-[76px] items-center justify-end gap-1.5">
        <button
          type="button"
          aria-label="Retirer des favoris"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="ease-expo flex h-7 w-7 items-center justify-center rounded-md border bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
          style={{
            borderColor: "rgba(245,158,11,0.4)",
            color: "#F59E0B",
          }}
        >
          <Star className="h-3.5 w-3.5" strokeWidth={1.5} fill="#F59E0B" />
        </button>
        <button
          type="button"
          aria-label="Ouvrir la fiche"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFiche();
          }}
          className="ease-expo flex h-7 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.05]"
        >
          <ArrowRight className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
        </button>
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