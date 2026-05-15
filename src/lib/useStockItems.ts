import { useCallback, useEffect, useState } from "react";
import {
  isHistorique,
  newStockEvent,
  type PlatformKey,
  type StockItem,
} from "@/components/stock/datasets";

const KEY_V1 = "monark.stock.items.v1";

function load(): StockItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_V1);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is StockItem =>
          x != null &&
          typeof x === "object" &&
          typeof x.id === "string" &&
          (x.source === "catalog" || x.source === "custom") &&
          typeof x.purchase_price_eur === "number" &&
          typeof x.purchase_date === "string" &&
          typeof x.status === "string",
      )
      .map((x) => {
        const events = Array.isArray(x.events) ? x.events : [];
        if (events.length === 0) {
          events.push(newStockEvent("added", undefined));
          // backfill timestamp from created_at if available
          if (typeof x.created_at === "string") {
            events[0] = { ...events[0], at: x.created_at };
          }
        }
        return { ...x, events };
      });
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

  const update = useCallback((id: string, patch: Partial<StockItem>) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  }, []);

  const markAsListed = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "listed",
              events: [...(x.events ?? []), newStockEvent("listed")],
            }
          : x,
      ),
    );
  }, []);

  const markAsUnlisted = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "in_stock",
              events: [...(x.events ?? []), newStockEvent("delisted")],
            }
          : x,
      ),
    );
  }, []);

  const markAsSold = useCallback(
    (
      id: string,
      sale: {
        sale_price_eur: number;
        sale_date: string;
        sale_platform: PlatformKey;
        fees_eur: number;
      },
    ) => {
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: "sold",
                sale_price_eur: sale.sale_price_eur,
                sale_date: sale.sale_date,
                sale_platform: sale.sale_platform,
                fees_eur: sale.fees_eur,
                events: [
                  ...(x.events ?? []),
                  newStockEvent("sold", {
                    price_eur: sale.sale_price_eur,
                    platform: sale.sale_platform,
                    fees_eur: sale.fees_eur,
                  }),
                ],
              }
            : x,
        ),
      );
    },
    [],
  );

  const cancelSale = useCallback(
    (id: string, newStatus: "in_stock" | "returned") => {
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: newStatus,
                sale_price_eur: null,
                sale_date: null,
                sale_platform: null,
                fees_eur: null,
                events: [
                  ...(x.events ?? []),
                  newStockEvent(
                    newStatus === "returned" ? "returned" : "sale_cancelled",
                  ),
                ],
              }
            : x,
        ),
      );
    },
    [],
  );

  const historique = items.filter(isHistorique);

  return {
    items,
    historique,
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