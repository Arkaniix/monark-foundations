import { ArrowDown, ArrowUp, Calculator, TrendingUp, Eye, Coins } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Counter } from "../ui";
import type { StatTileData } from "./datasets";

type DashboardStatTileProps = {
  data: StatTileData;
};

/** Icône par métrique (présentation) — choisie depuis l'id de la tuile. */
const TILE_ICONS: Record<string, LucideIcon> = {
  estimations_month: Calculator,
  average_margin: TrendingUp,
  watchlist_count: Eye,
  credits_remaining: Coins,
};

/**
 * Tuile stat du Dashboard (§01 — VUE D'ENSEMBLE).
 * KPI épuré : libellé + valeur héro + contexte, avec une icône d'accent.
 * Plus de sparkline (graphique décoratif retiré).
 */
export function DashboardStatTile({ data }: DashboardStatTileProps) {
  const isPositiveDelta = data.delta_pct !== null && data.delta_pct >= 0;
  const deltaColor = isPositiveDelta ? "#10B981" : "#EF4444";
  const DeltaIcon = isPositiveDelta ? ArrowUp : ArrowDown;
  const Icon = TILE_ICONS[data.id];
  const suffix = data.format_hint === "euro" ? " €" : "";

  return (
    <div className="mk-card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          {data.label}
        </div>
        {Icon && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${data.accent_color}1A` }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: data.accent_color }}
              strokeWidth={2}
            />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[32px] font-semibold tabular-nums text-zinc-50">
          <Counter value={data.value} duration={1400} suffix={suffix} />
        </span>
        {data.format_hint === "ratio" && (
          <span className="font-mono text-[14px] tabular-nums text-zinc-600">/ 180</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {data.delta_pct !== null ? (
          <>
            <DeltaIcon className="h-3 w-3" style={{ color: deltaColor }} strokeWidth={2} />
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{ color: deltaColor }}
            >
              {isPositiveDelta ? "+" : ""}
              {data.delta_pct.toFixed(1)}%
            </span>
            <span className="font-mono text-[10px] text-zinc-600">vs mois passé</span>
          </>
        ) : (
          <span className="font-mono text-[10px] text-zinc-600">ce mois-ci</span>
        )}
      </div>
    </div>
  );
}

export default DashboardStatTile;
