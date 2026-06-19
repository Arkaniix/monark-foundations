import { getNumberLocale } from "@/lib/numberFormat";
import {
  Star,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronUp,
  ChevronDown,
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
import {
  formatRelativeShort,
  cycleSort,
  type SortableColumn,
  type SortState,
} from "./datasets";

type Props = {
  models: CatalogModel[];
  favoriteEntries: FavoriteEntry[];
  density: "compact" | "aere";
  sortState: SortState;
  onChangeSortState: (next: SortState) => void;
  onToggleFavorite: (id: string, currentMedian: number) => void;
  onSelectRow: (model: CatalogModel) => void;
};

type ColumnDef = {
  key: SortableColumn | "model" | "actions";
  label: string;
  width: string;
  sortable: boolean;
  sortKey?: SortableColumn;
  align?: "left" | "right";
};

const COLUMNS: ColumnDef[] = [
  { key: "model", label: "MODÈLE", width: "flex-1 min-w-[280px]", sortable: true, sortKey: "name" },
  { key: "score", label: "SCORE", width: "w-[60px]", sortable: true },
  { key: "median", label: "MÉDIANE", width: "w-[96px]", sortable: true },
  { key: "snapshot", label: "DEPUIS PIN", width: "w-[100px]", sortable: true },
  { key: "delta", label: "Δ", width: "w-[76px]", sortable: true },
  { key: "trend", label: "TENDANCE 30J", width: "w-[140px]", sortable: true },
  { key: "liquidity", label: "LIQUIDITÉ", width: "w-[118px]", sortable: true },
  { key: "margin", label: "MARGE", width: "w-[68px]", sortable: true },
  { key: "actions", label: "ACTIONS", width: "w-[76px]", sortable: false },
];

export default function WatchlistTable({
  models,
  favoriteEntries,
  density,
  sortState,
  onChangeSortState,
  onToggleFavorite,
  onSelectRow,
}: Props) {
  const navigate = useNavigate();
  const isAere = density === "aere";

  const handleHeaderClick = (col: ColumnDef) => {
    if (!col.sortable) return;
    const sortKey = col.sortKey ?? (col.key as SortableColumn);
    onChangeSortState(cycleSort(sortState, sortKey));
  };

  return (
    <div className="mk-card-flat-soft overflow-hidden">
      <div
        className={`flex items-center gap-3 border-b border-white/[0.06] px-4 ${isAere ? "h-10" : "h-9"}`}
        style={{ background: "var(--mk-surface-1)" }}
      >
        {COLUMNS.map((col) => {
          const sortKey = col.sortKey ?? (col.key as SortableColumn);
          const isActive =
            col.sortable && sortState !== null && sortState.column === sortKey;
          const direction = isActive ? sortState!.direction : null;

          if (!col.sortable) {
            return (
              <div
                key={col.key}
                className={`${col.width} font-mono text-[10px] tracking-[0.14em] text-zinc-600 ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.label}
              </div>
            );
          }

          return (
            <button
              key={col.key}
              type="button"
              onClick={() => handleHeaderClick(col)}
              className={`${col.width} ease-expo group flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] transition-colors`}
              style={{ color: isActive ? "#3B82F6" : "#71717A" }}
            >
              <span className="group-hover:text-zinc-300" style={{ color: isActive ? "#3B82F6" : undefined }}>
                {col.label}
              </span>
              {direction === "desc" && (
                <ChevronDown className="h-3 w-3" strokeWidth={2} />
              )}
              {direction === "asc" && (
                <ChevronUp className="h-3 w-3" strokeWidth={2} />
              )}
            </button>
          );
        })}
      </div>

      <div className={`${isAere ? "divide-y divide-white/[0.06]" : "divide-y divide-white/[0.03]"}`}>
        {models.map((m) => {
          const entry = favoriteEntries.find((e) => e.id === m.id) ?? null;
          const delta = computeMovementDelta(entry, m.median_eur);
          return (
            <TableRow
              key={m.id}
              model={m}
              entry={entry}
              delta={delta}
              isAere={isAere}
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

type RowProps = {
  model: CatalogModel;
  entry: FavoriteEntry | null;
  delta: MovementDelta | null;
  isAere: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
  onOpenFiche: () => void;
};

function TableRow({
  model,
  entry,
  delta,
  isAere,
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

  const rowHeight = isAere ? "h-[88px]" : "h-[60px]";
  const thumbSize = isAere ? "h-11 w-11" : "h-9 w-9";
  const titleSize = isAere ? "text-[15px]" : "text-[13px]";
  const medianSize = isAere ? "text-[15px]" : "text-[13px]";

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
      className={`ease-expo relative flex ${rowHeight} cursor-pointer items-center gap-3 px-4 transition-colors hover:bg-white/[0.025]`}
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
        <div className={`${thumbSize} shrink-0 overflow-hidden rounded border border-white/[0.06] bg-white/[0.015]`}>
          <ModelImage category={model.category} url={model.image_url} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`truncate ${titleSize} text-zinc-100`} title={model.name}>
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
          {isAere && (
            <div className="font-mono text-[9.5px] tracking-[0.1em] text-zinc-700">
              {model.n_obs} obs
              {entry ? ` · pinned ${formatRelativeShort(entry.snapshot_at)}` : ""}
            </div>
          )}
        </div>
      </div>

      <div className="w-[60px]">
        <CatalogScoreChip score={model.score} size={isAere ? "md" : "sm"} />
      </div>

      <div className={`w-[96px] font-mono ${medianSize} tabular-nums text-zinc-100`}>
        <AnimatedCounter value={model.median_eur} suffix=" €" decimals={0} />
      </div>

      <div className="flex w-[100px] flex-col gap-0.5">
        <span className="font-mono text-[12px] tabular-nums text-zinc-500">
          {entry && entry.snapshot_eur !== null
            ? `${Math.round(entry.snapshot_eur).toLocaleString(getNumberLocale())} €`
            : "—"}
        </span>
        <span className="font-mono text-[9px] tracking-[0.1em] text-zinc-700">
          {entry ? formatRelativeShort(entry.snapshot_at) : ""}
        </span>
      </div>

      <div className="w-[76px]">
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

      <div className="flex w-[140px] items-center gap-1.5">
        <Sparkline
          points={model.sparkline_30d}
          color={getTrendColor(model.trend_30d_pct)}
          w={isAere ? 56 : 48}
          h={isAere ? 18 : 14}
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

      <div className="flex w-[118px] items-center gap-2">
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
        className="w-[68px] font-mono text-[12px] tabular-nums"
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
