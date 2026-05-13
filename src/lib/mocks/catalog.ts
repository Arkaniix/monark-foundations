/**
 * Mock implementation Catalog API.
 */

import { CATALOG_MODELS } from "../../components/catalog/mockData";
import { queryCatalog } from "../../components/catalog/filters";
import type {
  CatalogFilters,
  CatalogListResponse,
  CatalogSortKey,
} from "../../components/catalog/datasets";

const MOCK_DELAY_MS = 180;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listModels(
  filters: CatalogFilters,
  sort: CatalogSortKey,
  page: number,
): Promise<CatalogListResponse> {
  await delay(MOCK_DELAY_MS);
  return queryCatalog(CATALOG_MODELS, filters, sort, page);
}