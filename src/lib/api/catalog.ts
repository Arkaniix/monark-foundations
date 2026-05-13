/**
 * Vraie implémentation Catalog API. Placeholder.
 */

import { ApiException } from "./client";
import type {
  CatalogFilters,
  CatalogListResponse,
  CatalogSortKey,
} from "../../components/catalog/datasets";
import type { CatalogModelDetail } from "../../components/catalog/modelDetail";

export async function listModels(
  _filters: CatalogFilters,
  _sort: CatalogSortKey,
  _page: number,
): Promise<CatalogListResponse> {
  throw new ApiException(
    501,
    "Catalog endpoint not yet implemented in backend. Use VITE_USE_MOCK_API=true.",
    "NOT_IMPLEMENTED",
  );
}

export async function getModelDetail(_id: string): Promise<CatalogModelDetail | null> {
  throw new ApiException(
    501,
    "Catalog model detail endpoint not yet implemented. Use VITE_USE_MOCK_API=true.",
    "NOT_IMPLEMENTED",
  );
}