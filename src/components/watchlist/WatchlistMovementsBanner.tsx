import { TrendingUp } from "lucide-react";

type Props = {
  count: number;
  thresholdPct: number;
};

/**
 * Banner d'alerte visuelle sur la Watchlist : nombre de modèles dont l'évolution
 * depuis épinglage dépasse le seuil (±5% par défaut).
 *
 * Renvoie `null` si count = 0.
 */
export default function WatchlistMovementsBanner({ count, thresholdPct }: Props) {
  if (count === 0) return null;

  return (
    <div
      className="mk-card-flat-soft relative overflow-hidden"
      style={{
        background: "rgba(13,26,46,0.6)",
        borderColor: "rgba(59,130,246,0.33)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: "#3B82F6" }}
      />
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "rgba(59,130,246,0.18)" }}
        >
          <TrendingUp className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[13px] font-medium text-zinc-100">
            <span className="tabular-nums">{count}</span>{" "}
            {count === 1
              ? "modèle a bougé de manière significative"
              : "modèles ont bougé de manière significative"}
          </div>
          <div className="text-[11.5px] text-zinc-400">
            Seuil ±{thresholdPct}% — médiane actuelle vs prix au moment de l'épinglage.
          </div>
        </div>
      </div>
    </div>
  );
}