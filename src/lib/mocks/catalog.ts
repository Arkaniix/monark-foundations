/**
 * Mock implementation Catalog API.
 */

import { CATALOG_MODELS } from "../../components/catalog/mockData";
import { queryCatalog } from "../../components/catalog/filters";
import { buildModelDetail } from "../../components/catalog/modelDetail";
import type {
  CatalogFilters,
  CatalogListResponse,
  CatalogModel,
  CatalogSortKey,
} from "../../components/catalog/datasets";
import type { CatalogModelDetail } from "../../components/catalog/modelDetail";

const MOCK_DELAY_MS = 180;
const DETAIL_DELAY_MS = 220;

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

export async function getModelDetail(id: string): Promise<CatalogModelDetail | null> {
  await delay(DETAIL_DELAY_MS);
  const model = CATALOG_MODELS.find((m) => m.id === id);
  if (!model) return null;
  return buildModelDetail(model, CATALOG_MODELS);
}

export async function getAllModels(): Promise<CatalogModel[]> {
  return CATALOG_MODELS;
}
