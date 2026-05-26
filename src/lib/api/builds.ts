import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import { PLAT_FRONT_TO_API, platToFront, CAT_FRONT_TO_API, catToFront } from "./inventory";
import type {
  Build,
  BuildComponent,
  BuildEvent,
  BuildStatus,
  BuildComponentKind,
} from "@/components/stock/buildsDatasets";
import type { PlatformKey } from "@/components/stock/datasets";

// ── Forme API ────────────────────────────────────────────────────────────
interface ApiBuildComponent {
  id: number;
  build_id: number;
  kind: string;
  stock_item_id: number | null;
  label: string;
  category_snapshot: string | null;
  purchase_price_eur: number;
  notes: string | null;
  added_at: string;
}
interface ApiBuild {
  id: number;
  short_id: string;
  name: string;
  status: string;
  expected_sale_price_eur: number | null;
  sale_price_eur: number | null;
  sale_platform: string | null;
  sale_date: string | null;
  fees_eur: number | null;
  notes: string | null;
  components: ApiBuildComponent[];
  events: { type: string; at: string; payload: Record<string, unknown> | null }[];
  created_at: string;
}
interface ApiBuildPage {
  items: ApiBuild[];
  total: number;
  limit: number;
  offset: number;
}

// ── Mapping API → front ──────────────────────────────────────────────────
function mapComponent(c: ApiBuildComponent): BuildComponent {
  return {
    id: String(c.id),
    kind: c.kind as BuildComponentKind,
    stock_item_id: c.stock_item_id != null ? String(c.stock_item_id) : null,
    label: c.label,
    category_snapshot: catToFront(c.category_snapshot),
    purchase_price_eur: c.purchase_price_eur,
    notes: c.notes ?? null,
    added_at: c.added_at,
  };
}
function mapEvent(e: ApiBuild["events"][number]): BuildEvent {
  const p = e.payload ?? null;
  const payload = p
    ? ({
        ...p,
        sale_platform:
          typeof p.sale_platform === "string" ? platToFront(p.sale_platform) : undefined,
      } as BuildEvent["payload"])
    : undefined;
  return { type: e.type as BuildEvent["type"], at: e.at, payload };
}
export function mapBuild(b: ApiBuild): Build {
  return {
    id: String(b.id),
    short_id: b.short_id,
    name: b.name,
    status: b.status as BuildStatus,
    components: (b.components ?? []).map(mapComponent),
    expected_sale_price_eur: b.expected_sale_price_eur ?? null,
    sale_price_eur: b.sale_price_eur ?? null,
    sale_date: b.sale_date ?? null,
    sale_platform: b.sale_platform ? platToFront(b.sale_platform) : null,
    fees_eur: b.fees_eur ?? null,
    notes: b.notes ?? null,
    events: (b.events ?? []).map(mapEvent),
    created_at: b.created_at,
  };
}

// ── Payload builders ─────────────────────────────────────────────────────
function buildUpdatePayload(patch: Partial<Build>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if ("name" in patch) out.name = patch.name;
  if ("expected_sale_price_eur" in patch) out.expected_sale_price_eur = patch.expected_sale_price_eur;
  if ("notes" in patch) out.notes = patch.notes;
  if ("sale_price_eur" in patch) out.sale_price_eur = patch.sale_price_eur;
  if ("sale_date" in patch) out.sale_date = patch.sale_date;
  if ("sale_platform" in patch)
    out.sale_platform = patch.sale_platform ? PLAT_FRONT_TO_API[patch.sale_platform] : null;
  if ("fees_eur" in patch) out.fees_eur = patch.fees_eur;
  if ("status" in patch) out.status = patch.status;
  return out;
}
function componentCreatePayload(c: BuildComponent): Record<string, unknown> {
  return {
    kind: c.kind,
    stock_item_id: c.stock_item_id ? Number(c.stock_item_id) : null,
    label: c.label,
    category_snapshot:
      c.category_snapshot && c.category_snapshot !== "OTHER"
        ? CAT_FRONT_TO_API[c.category_snapshot]
        : "other",
    purchase_price_eur: c.purchase_price_eur,
    notes: c.notes,
  };
}

const J = (body: unknown) => JSON.stringify(body);
async function postBuild(path: string, body?: unknown): Promise<Build> {
  const r = await apiFetch<ApiBuild>(path, {
    method: "POST",
    ...(body !== undefined ? { body: J(body) } : {}),
  });
  return mapBuild(r);
}

// ── API calls ────────────────────────────────────────────────────────────
export async function fetchBuilds(): Promise<Build[]> {
  const page = await apiFetch<ApiBuildPage>(`${ENDPOINTS.BUILDS}?limit=100`, { method: "GET" });
  return (page.items ?? []).map(mapBuild);
}
export async function createBuild(init?: { name?: string }): Promise<Build> {
  return postBuild(ENDPOINTS.BUILDS, init ?? {});
}
export async function updateBuild(id: string, patch: Partial<Build>): Promise<Build> {
  const r = await apiFetch<ApiBuild>(ENDPOINTS.BUILD_ITEM(id), {
    method: "PATCH",
    body: J(buildUpdatePayload(patch)),
  });
  return mapBuild(r);
}
export async function deleteBuild(id: string): Promise<void> {
  await apiFetch<void>(ENDPOINTS.BUILD_ITEM(id), { method: "DELETE" });
}
export async function addBuildComponent(id: string, c: BuildComponent): Promise<Build> {
  return postBuild(ENDPOINTS.BUILD_COMPONENTS(id), componentCreatePayload(c));
}
export async function removeBuildComponent(id: string, cid: string): Promise<Build> {
  const r = await apiFetch<ApiBuild>(ENDPOINTS.BUILD_COMPONENT_ITEM(id, cid), {
    method: "DELETE",
  });
  return mapBuild(r);
}
export async function updateBuildComponent(
  id: string,
  cid: string,
  patch: Partial<BuildComponent>,
): Promise<Build> {
  const body: Record<string, unknown> = {};
  if ("label" in patch) body.label = patch.label;
  if ("purchase_price_eur" in patch) body.purchase_price_eur = patch.purchase_price_eur;
  if ("notes" in patch) body.notes = patch.notes;
  if ("category_snapshot" in patch && patch.category_snapshot)
    body.category_snapshot =
      patch.category_snapshot === "OTHER" ? "other" : CAT_FRONT_TO_API[patch.category_snapshot];
  const r = await apiFetch<ApiBuild>(ENDPOINTS.BUILD_COMPONENT_ITEM(id, cid), {
    method: "PATCH",
    body: J(body),
  });
  return mapBuild(r);
}
export const testBuild = (id: string) => postBuild(ENDPOINTS.BUILD_TEST(id));
export const untestBuild = (id: string) => postBuild(ENDPOINTS.BUILD_UNTEST(id));
export const listBuild = (id: string) => postBuild(ENDPOINTS.BUILD_LIST(id));
export const unlistBuild = (id: string) => postBuild(ENDPOINTS.BUILD_UNLIST(id));
export const failBuild = (id: string) => postBuild(ENDPOINTS.BUILD_FAIL(id));
export const resellBuild = (id: string) => postBuild(ENDPOINTS.BUILD_RESELL(id));
export const duplicateBuild = (id: string) => postBuild(ENDPOINTS.BUILD_DUPLICATE(id));
export const resumeBuild = (id: string, mode: "reinject" | "keep_pieces") =>
  postBuild(ENDPOINTS.BUILD_RESUME(id), { mode });
export const sellBuild = (
  id: string,
  sale: { sale_price_eur: number; sale_date: string; sale_platform: PlatformKey; fees_eur: number },
) =>
  postBuild(ENDPOINTS.BUILD_SELL(id), {
    sale_price_eur: sale.sale_price_eur,
    sale_date: sale.sale_date,
    sale_platform: PLAT_FRONT_TO_API[sale.sale_platform] ?? "other",
    fees_eur: sale.fees_eur,
  });
export const cancelBuildSale = (id: string, mode: "listed" | "returned") =>
  postBuild(ENDPOINTS.BUILD_CANCEL_SALE(id), { new_status: mode });