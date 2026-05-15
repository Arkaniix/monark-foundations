import { useCallback, useEffect, useMemo, useState } from "react";
import type { AccountingEntry } from "@/components/stock/accountingDatasets";

const KEY_V1 = "monark.accounting.entries.v1";

function load(): AccountingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_V1);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is AccountingEntry =>
        x != null &&
        typeof x === "object" &&
        typeof x.id === "string" &&
        (x.kind === "expense" || x.kind === "income") &&
        typeof x.category === "string" &&
        typeof x.amount_eur === "number" &&
        typeof x.date === "string" &&
        typeof x.note === "string" &&
        typeof x.created_at === "string",
    );
  } catch {
    return [];
  }
}

function save(items: AccountingEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_V1, JSON.stringify(items));
  } catch {
    /* noop */
  }
}

export function useAccountingEntries() {
  const [entries, setEntries] = useState<AccountingEntry[]>(() => load());

  useEffect(() => {
    save(entries);
  }, [entries]);

  const add = useCallback((entry: AccountingEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<AccountingEntry>) => {
      setEntries((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      );
    },
    [],
  );

  const getById = useCallback(
    (id: string): AccountingEntry | null =>
      entries.find((x) => x.id === id) ?? null,
    [entries],
  );

  const expenses = useMemo(
    () => entries.filter((e) => e.kind === "expense"),
    [entries],
  );
  const incomes = useMemo(
    () => entries.filter((e) => e.kind === "income"),
    [entries],
  );

  return { entries, expenses, incomes, add, update, remove, getById };
}