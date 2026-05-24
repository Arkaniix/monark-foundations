/**
 * Vraie implémentation Catalog API (mode réel, VITE_USE_MOCK_API=false).
 *
 * Signatures STRICTEMENT identiques au placeholder et au mock
 * (src/lib/mocks/catalog.ts) pour que le routing typeof realCatalog dans
 * api/index.ts reste valide. Toute la mécanique réelle (fetch paginé, mapping,
 * cache, dérivations) est dans src/lib/catalogSource.ts.
 *
 * On réutilise queryCatalog() et buildModelDetail() du domaine catalog : une
 * fois les modèles réels mappés en CatalogModel, le filtrage/tri/pagination et
 * la dérivation de la fiche détail sont identiques au mock.
 */

import { fetchAllCatalogModels } from "../catalogSource";
import { queryCatalog } from "../../components/catalog/filters";
import { buildModelDetail } from "../../components/catalog/modelDetail";
import type {
  CatalogFilters,
  CatalogListResponse,
  CatalogModel,
  CatalogSortKey,
} from "../../components/catalog/datasets";
import type { CatalogModelDetail } from "../../components/catalog/modelDetail";

export async function listModels(
  filters: CatalogFilters,
  sort: CatalogSortKey,
  page: number,
): Promise<CatalogListResponse> {
  const all = await fetchAllCatalogModels();
  return queryCatalog(all, filters, sort, page);
}

export async function getModelDetail(id: string): Promise<CatalogModelDetail | null> {
  const all = await fetchAllCatalogModels();
  const model = all.find((m) => m.id === id);
  if (!model) return null;
  return buildModelDetail(model, all);
}

/**
 * Tous les modèles (réels), pour les compteurs d'onglets, les facettes de filtre
 * et le total « modèles indexés » de la page Catalogue. Quasi gratuit : réutilise
 * le cache rempli par listModels().
 */
export async function getAllModels(): Promise<CatalogModel[]> {
  return fetchAllCatalogModels();
}
