import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  X,
  Star,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Calculator,
} from "lucide-react";
import { catalogApi } from "@/lib/api";
import type { CatalogModel } from "@/components/catalog/datasets";
import {
  MANUFACTURER_DOT_COLOR,
  getTrendColor,
  getLiquidityColor,
  getMarginColor,
  getScoreColor,
} from "@/components/catalog/datasets";
import type { CatalogModelDetail } from "@/components/catalog/modelDetail";
import { Sparkline } from "@/components/ui/Sparkline";
import PercentileChart from "@/components/ui/PercentileChart";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useCatalogFavorites,
  computeMovementDelta,
} from "@/lib/catalogFavorites";
import { formatRelativeShort } from "./datasets";

type Props = {
  models: CatalogModel[];
  selectedId: string | null;
  onClose: () => void;
  onSelectId: (id: string) => void;
};

/**
 * Drawer quick view Watchlist V1.
 * Slide-in from right, 480px desktop / full screen mobile.
 * Fetch CatalogModelDetail à chaque changement de selectedId.
 * Navigation : flèches ↑↓ + clavier. ESC + backdrop pour fermer.
 */
export default function WatchlistDrawer({
  models,
  selectedId,
  onClose,
  onSelectId,
}: Props) {
  const isOpen = selectedId !== null;
  const navigate = useNavigate();
  const favorites = useCatalogFavorites();

  const [detail, setDetail] = useState<CatalogModelDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    catalogApi
      .getModelDetail(selectedId)
      .then((d) => {
        if (!cancelled) {
          setDetail(d);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIdx = models.findIndex((m) => m.id === selectedId);
        if (currentIdx < 0 || models.length === 0) return;
        const delta = e.key === "ArrowDown" ? 1 : -1;
        const nextIdx = (currentIdx + delta + models.length) % models.length;
        onSelectId(models[nextIdx].id);
      }
    },
    [isOpen, selectedId, models, onClose, onSelectId],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const model = models.find((m) => m.id === selectedId) ?? null;
  if (!model) return null;

  const isFavorite = favorites.has(model.id);
  const favoriteEntry = favorites.getSnapshot(model.id);
  const delta = computeMovementDelta(favoriteEntry, model.median_eur);

  const currentIdx = models.findIndex((m) => m.id === model.id);
  const navPrev = () => {
    if (models.length === 0) return;
    const next = (currentIdx - 1 + models.length) % models.length;
    onSelectId(models[next].id);
  };
  const navNext = () => {
    if (models.length === 0) return;
    const next = (currentIdx + 1) % models.length;
    onSelectId(models[next].id);
  };

  const trendColor = getTrendColor(model.trend_30d_pct);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
        style={{
          animation: "watchlist-backdrop-in 200ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      />

      {/* Drawer */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-white/10 bg-[#0A0A0B] md:w-[480px]"
        style={{
          animation: "watchlist-drawer-in 280ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">
              APERÇU MODÈLE · {currentIdx + 1} / {models.length}
            </div>
            <h2 className="mt-1 truncate text-base font-semibold text-zinc-100">
              {model.name}
            </h2>
            <div className="mt-1 flex items-center gap-2 font-mono text-[10.5px] text-zinc-500">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: MANUFACTURER_DOT_COLOR[model.manufacturer] }}
              />
              <span>{model.manufacturer}</span>
              <span className="text-zinc-700">·</span>
              <span>{model.family}</span>
              <span className="text-zinc-700">·</span>
              <span>{model.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="ease-expo rounded-md border border-white/10 bg-white/[0.02] p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <X size={14} />
          </button>
        </header>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-5">
            {/* Score + actions */}
            <div className="flex items-center justify-between gap-4">
              <ScorePanel score={model.score} />
              <div className="flex items-center gap-2">
                <ActionButton
                  label="Favori"
                  onClick={() => favorites.toggle(model.id, model.median_eur)}
                  active={isFavorite}
                  activeColor="#F59E0B"
                >
                  <Star size={14} fill={isFavorite ? "#F59E0B" : "none"} />
                </ActionButton>
              </div>
            </div>

            {/* Évolution depuis épinglage */}
            {favoriteEntry && delta !== null && favoriteEntry.snapshot_eur !== null && (
              <SnapshotPanel
                snapshotEur={favoriteEntry.snapshot_eur}
                snapshotAt={favoriteEntry.snapshot_at}
                currentMedian={model.median_eur}
                deltaPct={delta.pct}
                isSignificant={delta.isSignificant}
                direction={delta.direction}
              />
            )}

            {/* Sparkline 90j */}
            <SparklinePanel
              isLoading={isLoading}
              sparkline90d={detail?.sparkline_90d ?? null}
              color={trendColor}
            />

            {/* Triptyque */}
            <TriptychPanel
              trendPct={model.trend_30d_pct}
              liquidityPct={model.liquidity_pct}
              marginPct={model.margin_pct}
              nObs={model.n_obs}
            />

            {/* Distribution */}
            <DistributionPanel
              isLoading={isLoading}
              distribution={detail?.percentiles ?? null}
              currentMedian={model.median_eur}
              scoreColor={getScoreColor(model.score)}
            />
          </div>
        </div>

        {/* Footer CTAs */}
        <footer className="flex items-center gap-2 border-t border-white/10 bg-[#0A0A0B] px-4 py-3">
          <button
            onClick={navPrev}
            aria-label="Modèle précédent (↑)"
            className="ease-expo rounded-md border border-white/10 bg-white/[0.02] p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={navNext}
            aria-label="Modèle suivant (↓)"
            className="ease-expo rounded-md border border-white/10 bg-white/[0.02] p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <ArrowDown size={14} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              navigate({ to: "/catalogue/$modelId", params: { modelId: model.id } });
              onClose();
            }}
            className="ease-expo flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
          >
            <ExternalLink size={12} className="text-zinc-400" />
            <span className="font-mono text-[10.5px] tracking-[0.06em] text-zinc-200">
              FICHE COMPLÈTE
            </span>
          </button>
          <button
            onClick={() => {
              navigate({
                to: "/estimator",
                search: { model: model.name },
              });
              onClose();
            }}
            className="ease-expo flex items-center gap-1.5 rounded-md border px-3 py-2.5 transition-colors"
            style={{
              background: "rgba(16,185,129,0.12)",
              borderColor: "rgba(16,185,129,0.36)",
            }}
          >
            <Calculator size={12} style={{ color: "#10B981" }} />
            <span
              className="font-mono text-[10.5px] tracking-[0.06em]"
              style={{ color: "#10B981" }}
            >
              ESTIMER
            </span>
            <ArrowRight size={12} style={{ color: "#10B981" }} />
          </button>
        </footer>
      </aside>

      <style>{`
        @keyframes watchlist-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes watchlist-drawer-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-panels                                                                 */
/* -------------------------------------------------------------------------- */

function ScorePanel({ score }: { score: number }) {
  const color = getScoreColor(score);
  const verdict =
    score >= 75 ? "Excellent" : score >= 50 ? "Correct" : "À éviter";
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-md border font-mono text-base tabular-nums"
        style={{
          background: "rgba(9,9,11,0.85)",
          borderColor: `${color}55`,
          color,
        }}
      >
        {score}
      </div>
      <div>
        <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">
          SCORE MONARK
        </div>
        <div className="text-sm font-medium text-zinc-200" style={{ color }}>
          {verdict}
        </div>
      </div>
    </div>
  );
}

type SnapshotPanelProps = {
  snapshotEur: number;
  snapshotAt: string;
  currentMedian: number;
  deltaPct: number;
  isSignificant: boolean;
  direction: "up" | "down" | "flat";
};

function SnapshotPanel({
  snapshotEur,
  snapshotAt,
  currentMedian,
  deltaPct,
  isSignificant,
  direction,
}: SnapshotPanelProps) {
  const isDrop = direction === "down" && isSignificant;
  const isUp = direction === "up" && isSignificant;
  const accent = isDrop ? "#EF4444" : isUp ? "#10B981" : "#3B82F6";
  const bg = isDrop
    ? "rgba(31,15,15,0.6)"
    : isUp
      ? "rgba(15,31,18,0.6)"
      : "rgba(13,26,46,0.6)";
  const label = isDrop
    ? "▼ ÉVOLUTION DEPUIS PIN"
    : isUp
      ? "▲ ÉVOLUTION DEPUIS PIN"
      : "ÉVOLUTION";

  return (
    <div
      className="rounded-md border px-3.5 py-3"
      style={{ background: bg, borderColor: `${accent}55` }}
    >
      <div
        className="font-mono text-[9.5px] tracking-[0.2em]"
        style={{ color: accent }}
      >
        {label}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[12px] tabular-nums">
        <span className="text-zinc-300">
          {Math.round(snapshotEur).toLocaleString("fr-FR")} €
        </span>
        <span className="text-[10.5px] text-zinc-500">
          ({formatRelativeShort(snapshotAt)})
        </span>
        <span className="text-zinc-600">→</span>
        <span className="text-zinc-100">
          {Math.round(currentMedian).toLocaleString("fr-FR")} €
        </span>
        <span style={{ color: accent }}>
          {deltaPct >= 0 ? "+" : ""}
          {deltaPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

type SparklinePanelProps = {
  isLoading: boolean;
  sparkline90d: number[] | null;
  color: string;
};

function SparklinePanel({ isLoading, sparkline90d, color }: SparklinePanelProps) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] px-3.5 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          MÉDIANE 90 JOURS
        </div>
        <div className="font-mono text-[10px] text-zinc-600">€</div>
      </div>
      {isLoading || !sparkline90d ? (
        <Skeleton className="h-16 w-full rounded" />
      ) : (
        <div className="h-16">
          <Sparkline
            points={sparkline90d}
            color={color}
            fill
            fillHeight
            hover
            animate={false}
          />
        </div>
      )}
    </div>
  );
}

type TriptychProps = {
  trendPct: number;
  liquidityPct: number;
  marginPct: number;
  nObs: number;
};

function TriptychPanel({ trendPct, liquidityPct, marginPct, nObs }: TriptychProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCell
        label="TEND. 30J"
        value={`${trendPct >= 0 ? "+" : ""}${trendPct.toFixed(1)}%`}
        color={getTrendColor(trendPct)}
        hint={trendPct > 0.5 ? "haussier" : trendPct < -0.5 ? "baissier" : "stable"}
      />
      <StatCell
        label="LIQUIDITÉ"
        value={`${Math.round(liquidityPct)}%`}
        color={getLiquidityColor(liquidityPct)}
        bar={liquidityPct}
      />
      <StatCell
        label="MARGE"
        value={`${marginPct.toFixed(1)}%`}
        color={getMarginColor(marginPct)}
        hint={`${nObs} obs`}
      />
    </div>
  );
}

type StatCellProps = {
  label: string;
  value: string;
  color: string;
  hint?: string;
  bar?: number;
};

function StatCell({ label, value, color, hint, bar }: StatCellProps) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5">
      <div className="font-mono text-[9.5px] tracking-[0.18em] text-zinc-600">
        {label}
      </div>
      <div
        className="mt-1 font-mono text-[14px] tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 font-mono text-[9.5px] text-zinc-600">{hint}</div>
      )}
      {bar !== undefined && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, Math.max(0, bar))}%`,
              background: color,
            }}
          />
        </div>
      )}
    </div>
  );
}

type DistributionPanelProps = {
  isLoading: boolean;
  distribution: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  } | null;
  currentMedian: number;
  scoreColor: string;
};

function DistributionPanel({
  isLoading,
  distribution,
  currentMedian,
  scoreColor,
}: DistributionPanelProps) {
  if (isLoading || !distribution) {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.02] px-3.5 py-3">
        <div className="mb-2 font-mono text-[10px] tracking-wider text-zinc-500">
          DISTRIBUTION PERCENTILE
        </div>
        <Skeleton className="h-40 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] px-3.5 py-3">
      <PercentileChart
        distribution={distribution}
        color={scoreColor}
        chartTitle="DISTRIBUTION P10 → P90 · COMPARABLES SOLD"
        chartHint={`Médiane actuelle ${Math.round(currentMedian).toLocaleString("fr-FR")} €. Plus la barre est haute, plus il y a de transactions à ce prix.`}
      />
    </div>
  );
}

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  active: boolean;
  activeColor: string;
  children: React.ReactNode;
};

function ActionButton({
  label,
  onClick,
  active,
  activeColor,
  children,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="ease-expo rounded-md border p-2 transition-colors"
      style={{
        borderColor: active ? `${activeColor}55` : "rgba(255,255,255,0.10)",
        background: active ? `${activeColor}1A` : "rgba(255,255,255,0.02)",
        color: active ? activeColor : "#a1a1aa",
      }}
    >
      {children}
    </button>
  );
}