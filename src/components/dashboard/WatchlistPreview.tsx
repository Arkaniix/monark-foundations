import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { Sparkline } from "@/components/ui";
import type { WatchlistItem } from "./datasets";

type WatchlistPreviewProps = {
  data: WatchlistItem[];
};

/**
 * Preview de la watchlist (§03 du Dashboard).
 *
 * Grid 1 / 2 / 4 cols responsive.
 *
 * Animation : stagger 220ms entre les 4 cards (effet wave gauche → droite).
 * Hover : tooltip sur la sparkline (date FR + prix + delta vs J−1).
 *
 * La sparkline est wrappée dans un conteneur `aspect-ratio: 9/1` pour que la
 * hauteur scale proportionnellement à la largeur de la card. Évite l'effet
 * "aplati" en preview pleine taille (cards plus larges → sparkline plus haute).
 */

const STAGGER_MS = 220;
const SPARKLINE_ASPECT_RATIO = "9 / 1";

export function WatchlistPreview({ data }: WatchlistPreviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item, index) => (
        <Card key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}

type CardProps = {
  item: WatchlistItem;
  index: number;
};

function Card({ item, index }: CardProps) {
  const isPositive = item.delta_pct_vs_14d >= 0;
  const deltaColor = isPositive ? "#10B981" : "#EF4444";
  const DeltaIcon = isPositive ? ArrowUp : ArrowDown;

  const handleClick = () => {
    // TODO : naviguer vers /watchlist/<item.id> quand la route existera
    console.log("Voir le détail watchlist", item.id);
  };

  return (
    <div className="mk-card flex flex-col gap-3 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="truncate font-mono text-[13px] font-semibold text-zinc-100">
          {item.model_name}
        </span>
        <span className="shrink-0 font-mono text-[10px] tracking-wider text-zinc-500">
          {item.category}
        </span>
      </div>

      {/* Prix + delta */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[22px] font-semibold tabular-nums text-zinc-50">
          {item.average_price_7d}
        </span>
        <span className="font-mono text-[14px] text-zinc-600">€</span>
        <span className="font-mono text-[10px] text-zinc-600">/ 7j</span>
      </div>

      {/* Delta */}
      <div className="flex items-center gap-1">
        <DeltaIcon
          className="h-3 w-3"
          style={{ color: deltaColor }}
          strokeWidth={2}
        />
        <span
          className="font-mono text-[11px] tabular-nums"
          style={{ color: deltaColor }}
        >
          {isPositive ? "+" : ""}
          {item.delta_pct_vs_14d.toFixed(1)}%
        </span>
        <span className="font-mono text-[10px] text-zinc-600">vs 14j</span>
      </div>

      {/* Sparkline wrappée pour ratio constant 9:1 — pas d'aplatissement en preview pleine taille */}
      <div
        className="mt-1 w-full"
        style={{ aspectRatio: SPARKLINE_ASPECT_RATIO }}
      >
        <Sparkline
          points={item.sparkline}
          color={deltaColor}
          fillHeight
          fill
          delay={index * STAGGER_MS}
          hover
        />
      </div>

      {/* CTA "Voir le détail" */}
      <button
        type="button"
        onClick={handleClick}
        className="ease-expo group mt-2 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="font-mono text-[11px] text-zinc-400 group-hover:text-zinc-100">
          Voir le détail
        </span>
        <ChevronRight
          className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300"
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}

export default WatchlistPreview;
