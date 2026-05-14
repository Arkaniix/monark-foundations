import {
  Star,
  Bell,
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
  type AlertDelta,
  type AlertEntry,
  computeAlertDelta,
} from "@/lib/catalogAlerts";
import { formatRelativeShort, type WatchlistTabKey } from "./datasets";

type Props = {
  tab: WatchlistTabKey;
  models: CatalogModel[];
  favoriteIds: string[];
  alertEntries: AlertEntry[];
  onToggleFavorite: (id: string, currentMedian: number) => void;
  onToggleAlert: (id: string, currentMedian: number) => void;
  onSelectRow: (model: CatalogModel) => void;
};

export default function WatchlistTable({
  tab,
  models,
  favoriteIds,
  alertEntries,
  onToggleFavorite,
  onToggleAlert,
  onSelectRow,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="mk-card-flat-soft overflow-hidden">
      <TableHeader tab={tab} />
      <div className="flex flex-col divide-y divide-white/[0.04]">
        {models.map((m) => (
          <TableRow
            key={m.id}
            tab={tab}
            model={m}
            isFavorite={favoriteIds.includes(m.id)}
            alertEntry={alertEntries.find((e) => e.id === m.id) ?? null}
            onToggleFavorite={() => onToggleFavorite(m.id, m.median_eur)}
            onToggleAlert={() => onToggleAlert(m.id, m.median_eur)}
            onSelect={() => onSelectRow(m)}
            onOpenFiche={() =>
              navigate({ to: "/catalogue/$modelId", params: { modelId: m.id } })
            }
          />
        ))}
      </div>
    </div>
  );
}

type Column = { key: string; label: string; width: string };

function getColumns(tab: WatchlistTabKey): Column[] {
  return tab === "favorites"
    ? [
        { key: "model", label: "MODÈLE", width: "flex-1 min-w-[280px]" },
        { key: "score", label: "SCORE", width: "w-[64px]" },
        { key: "median", label: "MÉDIANE", width: "w-[100px]" },
        { key: "trend", label: "TENDANCE 30J", width: "w-[150px]" },
        { key: "liq", label: "LIQUIDITÉ", width: "w-[120px]" },
        { key: "margin", label: "MARGE", width: "w-[70px]" },
        { key: "nobs", label: "N OBS", width: "w-[60px]" },
        { key: "alert", label: "ALERTE", width: "w-[80px]" },
        { key: "actions", label: "ACTIONS", width: "w-[120px]" },
      ]
    : [
        { key: "model", label: "MODÈLE", width: "flex-1 min-w-[280px]" },
        { key: "score", label: "SCORE", width: "w-[64px]" },
        { key: "median", label: "MÉDIANE", width: "w-[100px]" },
        { key: "snap", label: "SNAPSHOT", width: "w-[110px]" },
        { key: "delta", label: "Δ vs ACTIV.", width: "w-[100px]" },
        { key: "trend", label: "TENDANCE 30J", width: "w-[150px]" },
        { key: "liq", label: "LIQUIDITÉ", width: "w-[120px]" },
        { key: "actions", label: "ACTIONS", width: "w-[120px]" },
      ];
}

function TableHeader({ tab }: { tab: WatchlistTabKey }) {
  const columns = getColumns(tab);
  return (
    <div className="flex h-9 items-center gap-3 border-b border-white/[0.06] bg-white/[0.015] px-4 font-mono text-[10px] tracking-[0.14em] text-zinc-500">
      {columns.map((col) => (
        <div
          key={col.key}
          className={col.width}
          style={{
            textAlign: col.key === "model" ? "left" : "right",
          }}
        >
          {col.label}
        </div>
      ))}
    </div>
  );
}

type RowProps = {
  tab: WatchlistTabKey;
  model: CatalogModel;
  isFavorite: boolean;
  alertEntry: AlertEntry | null;
  onToggleFavorite: () => void;
  onToggleAlert: () => void;
  onSelect: () => void;
  onOpenFiche: () => void;
};

function TableRow({
  tab,
  model,
  isFavorite,
  alertEntry,
  onToggleFavorite,
  onToggleAlert,
  onSelect,
  onOpenFiche,
}: RowProps) {
  const delta: AlertDelta | null = alertEntry
    ? computeAlertDelta(alertEntry, model.median_eur)
    : null;
  const isSignificant = delta?.isSignificant ?? false;
  const isDrop = isSignificant && delta?.direction === "down";
  const isUp = isSignificant && delta?.direction === "up";

  const rowBg = isDrop
    ? "rgba(239,68,68,0.06)"
    : isUp
      ? "rgba(16,185,129,0.06)"
      : "transparent";
  const rowAccent = isDrop ? "#EF4444" : isUp ? "#10B981" : "transparent";

  const columns = getColumns(tab);
  const colWidth = (key: string) =>
    columns.find((c) => c.key === key)?.width ?? "";

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
      className="ease-expo relative flex h-[64px] cursor-pointer items-center gap-3 px-4 transition-colors hover:bg-white/[0.025]"
      style={{ background: rowBg }}
    >
      {rowAccent !== "transparent" && (
        <span
          className="absolute inset-y-0 left-0 w-[2px]"
          style={{ background: rowAccent }}
        />
      )}

      {/* MODÈLE */}
      <div className={`flex items-center gap-3 ${colWidth("model")}`}>
        <div
          className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.06)",
          }}
        >
          <ModelImage category={model.category} url={model.image_url} />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="truncate text-[12.5px] font-medium text-zinc-100">
              {model.name}
            </span>
            {isDrop && (
              <span
                className="flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.06em]"
                style={{
                  background: "rgba(239,68,68,0.16)",
                  color: "#F87171",
                  border: "0.5px solid rgba(239,68,68,0.4)",
                }}
              >
                ▼ DROP {delta!.pct.toFixed(1)}%
              </span>
            )}
            {isUp && (
              <span
                className="flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.06em]"
                style={{
                  background: "rgba(16,185,129,0.16)",
                  color: "#34D399",
                  border: "0.5px solid rgba(16,185,129,0.4)",
                }}
              >
                ▲ UP +{delta!.pct.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] text-zinc-500">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: MANUFACTURER_DOT_COLOR[model.manufacturer] }}
            />
            <span>{model.manufacturer}</span>
            <span style={{ color: "#3F3F46" }}>·</span>
            <span>{model.family}</span>
          </div>
        </div>
      </div>

      {/* SCORE */}
      <div className={`flex justify-end ${colWidth("score")}`}>
        <CatalogScoreChip score={model.score} size="sm" />
      </div>

      {/* MÉDIANE */}
      <div
        className={`text-right font-mono text-[12px] text-zinc-200 tabular-nums ${colWidth("median")}`}
      >
        <AnimatedCounter value={Math.round(model.median_eur)} suffix=" €" />
      </div>

      {tab === "alerts" && (
        <>
          {/* SNAPSHOT */}
          <div className={`text-right ${colWidth("snap")}`}>
            <div className="font-mono text-[12px] text-zinc-300 tabular-nums">
              {alertEntry && alertEntry.snapshot_eur !== null
                ? `${Math.round(alertEntry.snapshot_eur).toLocaleString("fr-FR")} €`
                : "—"}
            </div>
            <div className="font-mono text-[9.5px] tracking-[0.04em] text-zinc-600">
              {alertEntry ? formatRelativeShort(alertEntry.snapshot_at) : ""}
            </div>
          </div>

          {/* Δ */}
          <div
            className={`text-right font-mono text-[12px] tabular-nums ${colWidth("delta")}`}
          >
            {delta === null ? (
              <span className="text-zinc-600">—</span>
            ) : (
              <span
                style={{
                  color: getTrendColor(delta.pct),
                  fontWeight: delta.isSignificant ? 600 : 400,
                }}
              >
                {delta.pct >= 0 ? "+" : ""}
                {delta.pct.toFixed(1)}%
              </span>
            )}
          </div>
        </>
      )}

      {/* TENDANCE 30J (always shown) */}
      <div
        className={`flex items-center justify-end gap-2 ${colWidth("trend")}`}
      >
        <div className="h-6 w-16 flex-shrink-0">
          <Sparkline
            points={model.sparkline_30d}
            color={getTrendColor(model.trend_30d_pct)}
            w={64}
            h={24}
            animate={false}
          />
        </div>
        <span
          className="font-mono text-[11.5px] tabular-nums"
          style={{ color: getTrendColor(model.trend_30d_pct) }}
        >
          {model.trend_30d_pct > 0 ? "+" : ""}
          {model.trend_30d_pct.toFixed(1)}%
        </span>
        <TrendArrow pct={model.trend_30d_pct} />
      </div>

      {/* LIQUIDITÉ */}
      <div className={`flex items-center gap-2 ${colWidth("liq")}`}>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${Math.min(100, Math.max(0, model.liquidity_pct))}%`,
              background: getLiquidityColor(model.liquidity_pct),
            }}
          />
        </div>
        <span
          className="font-mono text-[11px] tabular-nums"
          style={{ color: getLiquidityColor(model.liquidity_pct) }}
        >
          {Math.round(model.liquidity_pct)}%
        </span>
      </div>

      {tab === "favorites" && (
        <>
          {/* MARGE */}
          <div
            className={`text-right font-mono text-[11.5px] tabular-nums ${colWidth("margin")}`}
            style={{ color: getMarginColor(model.margin_pct) }}
          >
            {Math.round(model.margin_pct)}%
          </div>

          {/* N OBS */}
          <div
            className={`text-right font-mono text-[11px] tabular-nums text-zinc-500 ${colWidth("nobs")}`}
          >
            {model.n_obs}
          </div>

          {/* ALERTE pill */}
          <div className={`flex justify-end ${colWidth("alert")}`}>
            {alertEntry ? (
              <span
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.1em]"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  color: "#60A5FA",
                  border: "0.5px solid rgba(59,130,246,0.35)",
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "#3B82F6" }}
                />
                ACTIVE
              </span>
            ) : (
              <span
                className="inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.1em]"
                style={{
                  background: "transparent",
                  color: "#52525B",
                  border: "0.5px solid #27272A",
                }}
              >
                OFF
              </span>
            )}
          </div>
        </>
      )}

      {/* ACTIONS */}
      <div className={`flex items-center justify-end gap-1.5 ${colWidth("actions")}`}>
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
            size={12}
            strokeWidth={1.75}
            fill={isFavorite ? "#F59E0B" : "transparent"}
          />
        </IconButton>
        <IconButton
          label={alertEntry ? "Désactiver l'alerte" : "Activer l'alerte"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleAlert();
          }}
          active={alertEntry !== null}
          activeColor="#3B82F6"
        >
          <Bell
            size={12}
            strokeWidth={1.75}
            fill={alertEntry ? "#3B82F6" : "transparent"}
          />
        </IconButton>
        <button
          type="button"
          aria-label="Ouvrir la fiche"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFiche();
          }}
          className="ease-expo flex h-7 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
        >
          <ArrowRight size={12} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function TrendArrow({ pct }: { pct: number }) {
  const Icon = pct > 0.5 ? TrendingUp : pct < -0.5 ? TrendingDown : Minus;
  return <Icon size={12} strokeWidth={1.75} style={{ color: getTrendColor(pct) }} />;
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
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="ease-expo flex h-7 w-7 items-center justify-center rounded-md border transition-colors"
      style={{
        background: active ? `${activeColor}1F` : "rgba(255,255,255,0.02)",
        borderColor: active ? `${activeColor}66` : "rgba(255,255,255,0.10)",
        color: active ? activeColor : "#71717a",
      }}
    >
      {children}
    </button>
  );
}