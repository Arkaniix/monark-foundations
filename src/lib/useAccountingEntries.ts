import { useCallback, useEffect, useMemo, useState } from "react";
import type { AccountingEntry } from "@/components/stock/accountingDatasets";
import * as txApi from "./api/transactions";

export function useAccountingEntries() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setEntries(await txApi.fetchTransactions());
    } catch {
      /* garde l'état */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsert = (e: AccountingEntry) =>
    setEntries((prev) => {
      const i = prev.findIndex((x) => x.id === e.id);
      if (i === -1) return [e, ...prev];
      const next = [...prev];
      next[i] = e;
      return next;
    });

  const add = useCallback(
    async (entry: AccountingEntry) => {
      try {
        upsert(await txApi.createTransaction(entry));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, patch: Partial<AccountingEntry>) => {
      try {
        upsert(await txApi.updateTransaction(id, patch));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setEntries((prev) => prev.filter((x) => x.id !== id));
      try {
        await txApi.deleteTransaction(id);
      } catch {
        await refresh();
      }
    },
    [refresh],
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

  return { entries, expenses, incomes, loading, add, update, remove, getById };
}