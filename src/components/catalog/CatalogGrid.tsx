import type { CatalogModel } from "./datasets";
import CatalogCard from "./CatalogCard";

type Props = {
  models: CatalogModel[];
  favoriteIds: string[];
  alertIds: string[];
  onToggleFavorite: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onOpenDetails: (model: CatalogModel) => void;
};

/**
 * Grid responsive : 1 col sm, 2 col md, 3 col lg, 4 col xl.
 */
export default function CatalogGrid({
  models,
  favoriteIds,
  alertIds,
  onToggleFavorite,
  onToggleAlert,
  onOpenDetails,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {models.map((m) => (
        <CatalogCard
          key={m.id}
          model={m}
          isFavorite={favoriteIds.includes(m.id)}
          hasAlert={alertIds.includes(m.id)}
          onToggleFavorite={() => onToggleFavorite(m.id)}
          onToggleAlert={() => onToggleAlert(m.id)}
          onOpenDetails={() => onOpenDetails(m)}
        />
      ))}
    </div>
  );
}