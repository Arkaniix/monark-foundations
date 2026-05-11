import { ArrowDown, ArrowUp } from "lucide-react";
import { Counter, Sparkline } from "../ui";
import type { StatTileData } from "./datasets";

type DashboardStatTileProps = {
  data: StatTileData;
};

/**
 * Tuile stat du Dashboard.
 *
 * Layout :
 *   - Label mono uppercase tracking-[0.2em] zinc-500
 *   - Valeur grande (Counter animé) en font-mono tabular-nums
 *   - Suffixe ou ratio à côté (ex. "/ 180" pour crédits)
 *   - Delta % en bas-gauche avec icône arrow + couleur sémantique
 *   - Sparkline 30j en bas-droite, coloré selon accent_color
 *
 * Le format est dérivé de data.format_hint :
 *   - "integer" : entier (ex. 12)
 *   - "euro"    : entier + suffix " €" (ex. 85 €)
 *   - "ratio"   : valeur + " / " + cap (ex. 89 / 180), récupéré du context
 *                  (pour cet itération, cap codé en dur à partir de credits_cap
 *                  inférable, à raffiner plus tard via prop dédiée)
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
        />
      </div>
    </div>
  );
}

export default DashboardStatTile;
