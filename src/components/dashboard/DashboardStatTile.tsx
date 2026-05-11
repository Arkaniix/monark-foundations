import { ArrowDown, ArrowUp } from "lucide-react";
import { Counter, Sparkline } from "../ui";
import type { StatTileData } from "./datasets";

type DashboardStatTileProps = {
  data: StatTileData;
};

/**
 * Tuile stat du Dashboard.
 *
 * Note (C3a+) : la sparkline est rendue **sans animation** (`animate={false}`)
 * pour préserver le comportement d'origine : §01 affiche des KPIs cumulés où
 * l'animation Counter sur la valeur suffit à donner la narration "ça monte".
 * L'animation de tracé progressif est réservée à §03 watchlist preview.
 */
export function DashboardStatTile({ data }: DashboardStatTileProps) {
  const isPositiveDelta = data.delta_pct !== null && data.delta_pct >= 0;
  const deltaColor = isPositiveDelta ? "#10B981" : "#EF4444";
  const DeltaIcon = isPositiveDelta ? ArrowUp : ArrowDown;

  const suffix = data.format_hint === "euro" ? " €" : "";

  return (
    <div className="mk-card flex flex-col gap-3 p-5">
      <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
        {data.label}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[28px] font-semibold tabular-nums text-zinc-50">
          <Counter value={data.value} duration={1400} suffix={suffix} />
        </span>
        {data.format_hint === "ratio" && (
          <span className="font-mono text-[14px] tabular-nums text-zinc-600">
            / 180
          </span>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-1">
          {data.delta_pct !== null ? (
            <>
              <DeltaIcon
                className="h-3 w-3"
                style={{ color: deltaColor }}
                strokeWidth={2}
              />
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color: deltaColor }}
              >
                {isPositiveDelta ? "+" : ""}
                {data.delta_pct.toFixed(1)}%
              </span>
              <span className="font-mono text-[10px] text-zinc-600">
                vs mois passé
              </span>
            </>
          ) : (
            <span className="font-mono text-[10px] text-zinc-600">
              ce mois-ci
            </span>
          )}
        </div>

        <Sparkline
          points={data.sparkline}
          color={data.accent_color}
          w={80}
          h={24}
          fill
          animate={false}
        />
      </div>
    </div>
  );
}

export default DashboardStatTile;
