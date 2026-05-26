import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  AccountingEntry,
  AccountingKind,
  AccountingCategory,
} from "@/components/stock/accountingDatasets";

interface ApiTransaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  category: string | null;
  platform: string | null;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function mapToEntry(t: ApiTransaction): AccountingEntry {
  return {
    id: String(t.id),
    kind: t.type as AccountingKind,
    category: (t.category ?? "other_expense") as AccountingCategory,
    amount_eur: t.amount,
    date: t.transaction_date,
    note: t.description ?? "",
    created_at: t.created_at,
  };
}

function createPayload(e: AccountingEntry) {
  return {
    type: e.kind,
    amount: e.amount_eur,
    description: (e.note || "").trim() || "—",
    category: e.category,
    transaction_date: e.date,
  };
}

function updatePayload(patch: Partial<AccountingEntry>) {
  const out: Record<string, unknown> = {};
  if ("kind" in patch) out.type = patch.kind;
  if ("amount_eur" in patch) out.amount = patch.amount_eur;
  if ("note" in patch) out.description = (patch.note || "").trim() || "—";
  if ("category" in patch) out.category = patch.category;
  if ("date" in patch) out.transaction_date = patch.date;
  return out;
}

export async function fetchTransactions(): Promise<AccountingEntry[]> {
  const data = await apiFetch<unknown>(`${ENDPOINTS.TRANSACTIONS}?limit=100`, {
    method: "GET",
  });
  const d = (data ?? {}) as Record<string, unknown>;
  const items = (Array.isArray(data)
    ? data
    : (d.items ?? d.results ?? d.data ?? [])) as ApiTransaction[];
  return items.map(mapToEntry);
}

export async function createTransaction(
  e: AccountingEntry,
): Promise<AccountingEntry> {
  return mapToEntry(
    await apiFetch<ApiTransaction>(ENDPOINTS.TRANSACTIONS, {
      method: "POST",
      body: JSON.stringify(createPayload(e)),
    }),
  );
}

export async function updateTransaction(
  id: string,
  patch: Partial<AccountingEntry>,
): Promise<AccountingEntry> {
  return mapToEntry(
    await apiFetch<ApiTransaction>(ENDPOINTS.TRANSACTION_ITEM(id), {
      method: "PATCH",
      body: JSON.stringify(updatePayload(patch)),
    }),
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiFetch<void>(ENDPOINTS.TRANSACTION_ITEM(id), { method: "DELETE" });
}