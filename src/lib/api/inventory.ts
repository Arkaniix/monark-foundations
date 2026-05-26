import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  StockItem,
  StockEvent,
  StockSource,
  StockStatus,
  PlatformKey,
  ConditionKey,
} from "@/components/stock/datasets";
import type { HardwareCategory } from "@/components/catalog/datasets";

// ── Maps d'enum front↔API ────────────────────────────────────────────────
export const PLAT_FRONT_TO_API: Record<PlatformKey, string> = {
  LBC: "leboncoin",
  VINTED: "vinted",
  EBAY: "ebay",
  LOCAL: "other",
  AUTRE: "other",
};
const PLAT_API_TO_FRONT: Record<string, PlatformKey> = {
  leboncoin: "LBC",
  vinted: "VINTED",
  ebay: "EBAY",
  facebook: "AUTRE",
  hardware_fr: "AUTRE",
  other: "AUTRE",
};
const COND_FRONT_TO_API: Record<ConditionKey, string> = {
  NEUF: "new",
  TBE: "like_new",
  BON: "good",
  ACCEPTABLE: "occasion",
  POUR_PIECES: "for_parts",
};
const COND_API_TO_FRONT: Record<string, ConditionKey> = {
  new: "NEUF",
  like_new: "TBE",
  good: "BON",
  occasion: "ACCEPTABLE",
  for_parts: "POUR_PIECES",
};
export const CAT_FRONT_TO_API: Record<string, string> = {
  GPU: "gpu",
  CPU: "cpu",
  RAM: "ram",
  SSD: "ssd",
  MOBO: "motherboard",
  PSU: "other",
  OTHER: "other",
};
const CAT_API_TO_FRONT: Record<string, HardwareCategory | "OTHER"> = {
  gpu: "GPU",
  cpu: "CPU",
  ram: "RAM",
  ssd: "SSD",
  motherboard: "MOBO",
  other: "OTHER",
};
export function platToFront(v?: string | null): PlatformKey {
  return (v && PLAT_API_TO_FRONT[v]) || "AUTRE";
}
function condToFront(v?: string | null): ConditionKey {
  return (v && COND_API_TO_FRONT[v]) || "BON";
}
export function catToFront(v?: string | null): HardwareCategory | "OTHER" {
  return (v && CAT_API_TO_FRONT[v.toLowerCase()]) || "OTHER";
}

// ── Forme API ────────────────────────────────────────────────────────────
interface ApiInventoryRead {
  id: number;
  source: string;
  model_id: number | null;
  model_name: string | null;
  model_name_snapshot: string | null;
  category_name: string | null;
  category_snapshot: string | null;
  custom_name: string | null;
  category: string | null;
  build_id: number | null;
  buy_price: number;
  buy_platform: string | null;
  buy_date: string;
  buy_condition: string | null;
  sell_price: number | null;
  sell_platform: string | null;
  sell_date: string | null;
  fees_eur: number | null;
  status: string;
  notes: string | null;
  events: { type: string; at: string; payload: Record<string, unknown> | null }[];
  created_at: string;
}
interface ApiInventoryPage {
  items: ApiInventoryRead[];
  total: number;
  limit: number;
  offset: number;
}

// ── Mapping API → StockItem ──────────────────────────────────────────────
function mapEvent(e: ApiInventoryRead["events"][number]): StockEvent {
  const p = e.payload ?? undefined;
  return {
    type: e.type as StockEvent["type"],
    at: e.at,
    payload: p
      ? {
          price_eur: typeof p.price_eur === "number" ? (p.price_eur as number) : undefined,
          platform:
            typeof p.platform === "string" ? platToFront(p.platform as string) : undefined,
          fees_eur: typeof p.fees_eur === "number" ? (p.fees_eur as number) : undefined,
        }
      : undefined,
  };
}
export function mapReadToStockItem(r: ApiInventoryRead): StockItem {
  return {
    id: String(r.id),
    source: (r.source as StockSource) ?? "custom",
    model_id: r.model_id != null ? String(r.model_id) : null,
    custom_name: r.custom_name ?? null,
    custom_category: r.category ? catToFront(r.category) : null,
    model_name_snapshot: r.model_name_snapshot ?? r.model_name ?? r.custom_name ?? "Inconnu",
    category_snapshot: catToFront(r.category_snapshot ?? r.category_name ?? r.category),
    purchase_price_eur: r.buy_price,
    purchase_date: r.buy_date,
    purchase_platform: platToFront(r.buy_platform),
    condition: condToFront(r.buy_condition),
    notes: r.notes ?? null,
    status: r.status as StockStatus,
    sale_price_eur: r.sell_price ?? null,
    sale_date: r.sell_date ?? null,
    sale_platform: r.sell_platform ? platToFront(r.sell_platform) : null,
    fees_eur: r.fees_eur ?? null,
    build_id: r.build_id != null ? String(r.build_id) : null,
    created_at: r.created_at,
    events: (r.events ?? []).map(mapEvent),
  };
}

// ── Mapping StockItem → payloads API ─────────────────────────────────────
function buildCreatePayload(item: StockItem) {
  return {
    source: item.source,
    model_id: item.model_id ? Number(item.model_id) : null,
    custom_name: item.custom_name,
    category: item.custom_category ? CAT_FRONT_TO_API[item.custom_category] : null,
    model_name_snapshot: item.model_name_snapshot || null,
    category_snapshot: item.category_snapshot ? CAT_FRONT_TO_API[item.category_snapshot] : null,
    build_id: item.build_id ? Number(item.build_id) : null,
    buy_price: item.purchase_price_eur,
    buy_platform: PLAT_FRONT_TO_API[item.purchase_platform] ?? null,
    buy_date: item.purchase_date,
    buy_condition: COND_FRONT_TO_API[item.condition] ?? null,
    fees_eur: item.fees_eur ?? null,
    notes: item.notes,
  };
}
function buildUpdatePayload(patch: Partial<StockItem>) {
  const out: Record<string, unknown> = {};
  if ("purchase_price_eur" in patch) out.buy_price = patch.purchase_price_eur;
  if ("purchase_platform" in patch && patch.purchase_platform)
    out.buy_platform = PLAT_FRONT_TO_API[patch.purchase_platform];
  if ("purchase_date" in patch) out.buy_date = patch.purchase_date;
  if ("condition" in patch && patch.condition)
    out.buy_condition = COND_FRONT_TO_API[patch.condition];
  if ("fees_eur" in patch) out.fees_eur = patch.fees_eur;
  if ("notes" in patch) out.notes = patch.notes;
  if ("custom_name" in patch) out.custom_name = patch.custom_name;
  if ("custom_category" in patch)
    out.category = patch.custom_category ? CAT_FRONT_TO_API[patch.custom_category] : null;
  if ("model_name_snapshot" in patch) out.model_name_snapshot = patch.model_name_snapshot;
  if ("category_snapshot" in patch && patch.category_snapshot)
    out.category_snapshot = CAT_FRONT_TO_API[patch.category_snapshot];
  if ("build_id" in patch) out.build_id = patch.build_id ? Number(patch.build_id) : null;
  if ("model_id" in patch) out.model_id = patch.model_id ? Number(patch.model_id) : null;
  return out;
}

// ── Appels API (renvoient un StockItem mappé) ────────────────────────────
export async function fetchInventory(): Promise<StockItem[]> {
  const page = await apiFetch<ApiInventoryPage>(
    `${ENDPOINTS.INVENTORY}?limit=100&sort=date_desc`,
    { method: "GET" },
  );
  return (page.items ?? []).map(mapReadToStockItem);
}
export async function createInventoryItem(item: StockItem): Promise<StockItem> {
  const r = await apiFetch<ApiInventoryRead>(ENDPOINTS.INVENTORY, {
    method: "POST",
    body: JSON.stringify(buildCreatePayload(item)),
  });
  return mapReadToStockItem(r);
}
export async function updateInventoryItem(
  id: string,
  patch: Partial<StockItem>,
): Promise<StockItem> {
  const r = await apiFetch<ApiInventoryRead>(ENDPOINTS.INVENTORY_ITEM(id), {
    method: "PATCH",
    body: JSON.stringify(buildUpdatePayload(patch)),
  });
  return mapReadToStockItem(r);
}
export async function deleteInventoryItem(id: string): Promise<void> {
  await apiFetch<void>(ENDPOINTS.INVENTORY_ITEM(id), { method: "DELETE" });
}
export async function listInventoryItem(item: StockItem): Promise<StockItem> {
  const r = await apiFetch<ApiInventoryRead>(ENDPOINTS.INVENTORY_LIST(item.id), {
    method: "POST",
    body: JSON.stringify({
      listed_platform: PLAT_FRONT_TO_API[item.purchase_platform] ?? "other",
      listed_price: item.purchase_price_eur,
    }),
  });
  return mapReadToStockItem(r);
}
export async function unlistInventoryItem(id: string): Promise<StockItem> {
  const r = await apiFetch<ApiInventoryRead>(ENDPOINTS.INVENTORY_UNLIST(id), {
    method: "POST",
  });
  return mapReadToStockItem(r);
}
export async function sellInventoryItem(
  id: string,
  sale: { sale_price_eur: number; sale_date: string; sale_platform: PlatformKey; fees_eur: number },
): Promise<StockItem> {
  const r = await apiFetch<ApiInventoryRead>(ENDPOINTS.INVENTORY_SELL(id), {
    method: "POST",
    body: JSON.stringify({
      sell_price: sale.sale_price_eur,
      sell_platform: PLAT_FRONT_TO_API[sale.sale_platform] ?? "other",
      sell_date: sale.sale_date,
      fees_eur: sale.fees_eur,
    }),
  });
  return mapReadToStockItem(r);
}
export async function cancelSaleInventoryItem(
  id: string,
  newStatus: "in_stock" | "returned",
): Promise<StockItem> {
  const r = await apiFetch<ApiInventoryRead>(ENDPOINTS.INVENTORY_CANCEL_SALE(id), {
    method: "POST",
    body: JSON.stringify({ returned: newStatus === "returned" }),
  });
  return mapReadToStockItem(r);
}