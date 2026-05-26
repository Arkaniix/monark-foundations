import { useCallback, useEffect, useRef, useState } from "react";
import { isHistorique, type PlatformKey, type StockItem } from "@/components/stock/datasets";
import * as inventoryApi from "./api/inventory";

export function useStockItems() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsRef = useRef<StockItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const refresh = useCallback(async () => {
    try {
      setItems(await inventoryApi.fetchInventory());
    } catch {
      /* garde l'état courant */
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsert = (it: StockItem) =>
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === it.id);
      if (i === -1) return [it, ...prev];
      const next = [...prev];
      next[i] = it;
      return next;
    });

  const add = useCallback(
    async (item: StockItem) => {
      try {
        upsert(await inventoryApi.createInventoryItem(item));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((x) => x.id !== id));
      try {
        await inventoryApi.deleteInventoryItem(id);
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const getById = useCallback(
    (id: string): StockItem | null => items.find((x) => x.id === id) ?? null,
    [items],
  );

  const update = useCallback(
    async (id: string, patch: Partial<StockItem>) => {
      try {
        upsert(await inventoryApi.updateInventoryItem(id, patch));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const markAsListed = useCallback(
    async (id: string) => {
      const it = itemsRef.current.find((x) => x.id === id);
      if (!it) return;
      try {
        upsert(await inventoryApi.listInventoryItem(it));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const markAsUnlisted = useCallback(
    async (id: string) => {
      try {
        upsert(await inventoryApi.unlistInventoryItem(id));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const markAsSold = useCallback(
    async (
      id: string,
      sale: {
        sale_price_eur: number;
        sale_date: string;
        sale_platform: PlatformKey;
        fees_eur: number;
      },
    ) => {
      try {
        upsert(await inventoryApi.sellInventoryItem(id, sale));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const cancelSale = useCallback(
    async (id: string, newStatus: "in_stock" | "returned") => {
      try {
        upsert(await inventoryApi.cancelSaleInventoryItem(id, newStatus));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const historique = items.filter(isHistorique);

  return {
    items,
    historique,
    loading,
    refresh,
    add,
    remove,
    getById,
    update,
    markAsListed,
    markAsUnlisted,
    markAsSold,
    cancelSale,
  };
}