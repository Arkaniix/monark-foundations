/**
 * Logique pure de filtrage / tri / pagination du catalogue.
 */

import type {
  CatalogFilters,
  CatalogListResponse,
  CatalogModel,
  CatalogSortKey,
} from "./datasets";
import { PAGE_SIZE } from "./datasets";

function matchSearch(model: CatalogModel, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return (
    model.name.toLowerCase().includes(needle) ||
    model.manufacturer.toLowerCase().includes(needle) ||
    (model.brand?.toLowerCase().includes(needle) ?? false) ||
    model.family.toLowerCase().includes(needle)
  );
}

function applyFilters(
  models: CatalogModel[],
  filters: CatalogFilters,
): CatalogModel[] {
  return models.filter((m) => {
    if (m.category !== filters.category) return false;
    if (filters.manufacturer !== "ALL" && m.manufacturer !== filters.manufacturer)
      return false;
    if (filters.brand !== "ALL" && (m.brand ?? "") !== filters.brand) return false;
    if (filters.family !== "ALL" && m.family !== filters.family) return false;
    if (!matchSearch(m, filters.search)) return false;
    return true;
  });
}

function applySort(models: CatalogModel[], sort: CatalogSortKey): CatalogModel[] {
  const out = [...models];
  switch (sort) {
    case "score_desc":
      out.sort((a, b) => b.score - a.score);
      break;
    case "trend_desc":
      out.sort((a, b) => b.trend_30d_pct - a.trend_30d_pct);
      break;
    case "liquidity_desc":
      out.sort((a, b) => b.liquidity_pct - a.liquidity_pct);
      break;
    case "margin_desc":
      out.sort((a, b) => b.margin_pct - a.margin_pct);
      break;
    case "median_asc":
      out.sort((a, b) => a.median_eur - b.median_eur);
      break;
    case "median_desc":
      out.sort((a, b) => b.median_eur - a.median_eur);
      break;
    case "name_asc":
      out.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
  return out;
}

export function paginate(
  models: CatalogModel[],
  page: number,
  pageSize: number = PAGE_SIZE,
): CatalogListResponse {
  const total = models.length;
  const total_pages = Math.max(1, Math.ceil(total / pageSize));
  const safe_page = Math.max(1, Math.min(page, total_pages));
  const start = (safe_page - 1) * pageSize;
  return {
    models: models.slice(start, start + pageSize),
    total,
    page: safe_page,
    total_pages,
    page_size: pageSize,
  };
}

export function queryCatalog(
  models: CatalogModel[],
  filters: CatalogFilters,
  sort: CatalogSortKey,
  page: number,
): CatalogListResponse {
  const filtered = applyFilters(models, filters);
  const sorted = applySort(filtered, sort);
  return paginate(sorted, page);
}

export function getAvailableFacets(
  models: CatalogModel[],
  category: CatalogFilters["category"],
): {
  manufacturers: string[];
  brands: string[];
  families: string[];
} {
  const filtered = models.filter((m) => m.category === category);
  const manufacturers = Array.from(
    new Set(filtered.map((m) => m.manufacturer)),
  ).sort();
  const brands = Array.from(
    new Set(filtered.map((m) => m.brand).filter((b): b is string => !!b)),
  ).sort();
  const families = Array.from(new Set(filtered.map((m) => m.family))).sort();
  return { manufacturers, brands, families };
}

export function getCategoryCounts(
  models: CatalogModel[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const m of models) {
    counts[m.category] = (counts[m.category] ?? 0) + 1;
  }
  return counts;
}