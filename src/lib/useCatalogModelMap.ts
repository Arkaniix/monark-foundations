import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api";
import type { CatalogModel } from "@/components/catalog/datasets";

/**
 * Charge une fois les modèles du catalogue (via catalogApi, mis en cache) et
 * expose une Map indexée par id. Utilisé par les composants Stock pour résoudre
 * le détail d'un modèle (médiane, nom, image) à partir de item.model_id.
 *
 * Remplace l'ancien lookup direct sur le mock CATALOG_MODELS : les ids réels
 * (numériques) ne matchaient pas les ids mock, d'où des valeurs marché vides.
 */
export function useCatalogModelMap(): {
  byId: Map<string, CatalogModel>;
  loaded: boolean;
} {
  const [byId, setById] = useState<Map<string, CatalogModel>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getAllModels()
      .then((models) => {
        if (cancelled) return;
        setById(new Map(models.map((m) => [m.id, m])));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { byId, loaded };
}
