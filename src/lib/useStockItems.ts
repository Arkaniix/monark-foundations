import { useCallback, useEffect, useState } from "react";
import type { StockItem } from "@/components/stock/datasets";

const KEY_V1 = "monark.stock.items.v1";

function load(): StockItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_V1);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is StockItem =>
        x != null &&
        typeof x === "object" &&
        typeof x.id === "string" &&
        (x.source === "catalog" || x.source === "custom") &&
        typeof x.purchase_price_eur === "number" &&
        typeof x.purchase_date === "string" &&
        typeof x.status === "string",
    );
  } catch {
    return [];
  }
}

function save(items: StockItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_V1, JSON.stringify(items));
  } catch {
    /* noop */
  }
}

export function useStockItems() {
  const [items, setItems] = useState<StockItem[]>(() => load());

  useEffect(() => {
    save(items);
  }, [items]);

  const add = useCallback((item: StockItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const getById = useCallback(
    (id: string): StockItem | null => items.find((x) => x.id === id) ?? null,
    [items],
  );

  return { items, add, remove, getById };
}