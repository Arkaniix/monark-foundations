import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";

export interface ApiWatchItem {
  id: number;
  target_type: string;
  target_id: number;
  created_at: string;
  snapshot_eur: number | null;
  snapshot_at: string | null;
}

interface ApiWatchPage {
  items: ApiWatchItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchWatchlist(): Promise<ApiWatchItem[]> {
  const page = await apiFetch<ApiWatchPage>(
    `${ENDPOINTS.WATCHLIST}?target_type=model&limit=200`,
    { method: "GET" },
  );
  return (page.items ?? []).filter((i) => i.target_type === "model");
}

export async function addWatch(
  targetId: number,
  snapshotEur: number | null,
): Promise<ApiWatchItem> {
  return apiFetch<ApiWatchItem>(ENDPOINTS.WATCHLIST, {
    method: "POST",
    body: JSON.stringify({
      target_type: "model",
      target_id: targetId,
      snapshot_eur: snapshotEur,
    }),
  });
}

export async function removeWatch(itemId: number): Promise<void> {
  await apiFetch<void>(ENDPOINTS.WATCHLIST_ITEM(String(itemId)), {
    method: "DELETE",
  });
}