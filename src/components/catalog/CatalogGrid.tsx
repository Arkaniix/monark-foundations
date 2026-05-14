import type { CatalogModel } from "./datasets";
import CatalogCard from "./CatalogCard";
import FadeInSection from "../ui/FadeInSection";

type Props = {
  models: CatalogModel[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (model: CatalogModel) => void;
  gridKey?: string;
};

/**
 * Grid responsive : 1 col sm, 2 col md, 3 col lg, 4 col xl.
 */
export default function CatalogGrid({
  models,
  favoriteIds,
  onToggleFavorite,
  onOpenDetails,
  gridKey = "",
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {models.map((m, i) => (
        <FadeInSection key={`${gridKey}_${m.id}`} delay={Math.min(i, 12) * 30}>
          <CatalogCard
            model={m}
            isFavorite={favoriteIds.includes(m.id)}
            onToggleFavorite={() => onToggleFavorite(m.id)}
            onOpenDetails={() => onOpenDetails(m)}
          />
        </FadeInSection>
      ))}
    </div>
  );
}