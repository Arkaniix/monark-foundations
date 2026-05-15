import type { CatalogModel } from "../catalog/datasets";
import {
  computeMovementDelta,
  type FavoriteEntry,
} from "@/lib/catalogFavorites";
import WatchlistCard from "./WatchlistCard";

type Props = {
  models: CatalogModel[];
  favoriteEntries: FavoriteEntry[];
  onToggleFavorite: (id: string, currentMedian: number) => void;
  onSelectRow: (model: CatalogModel) => void;
};

export default function WatchlistCardGrid({
  models,
  favoriteEntries,
  onToggleFavorite,
  onSelectRow,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {models.map((m) => {
        const entry = favoriteEntries.find((e) => e.id === m.id) ?? null;
        const delta = computeMovementDelta(entry, m.median_eur);
        return (
          <WatchlistCard
            key={m.id}
            model={m}
            entry={entry}
            delta={delta}
            onToggleFavorite={() => onToggleFavorite(m.id, m.median_eur)}
            onSelect={() => onSelectRow(m)}
          />
        );
      })}
    </div>
  );
}
