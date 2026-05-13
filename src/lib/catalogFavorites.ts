import { useCallback, useEffect, useState } from "react";

const KEY = "monark.catalog.favorites.v1";

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* noop */
  }
}

export function useCatalogFavorites() {
  const [ids, setIds] = useState<string[]>(() => load());

  useEffect(() => {
    save(ids);
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, has };
}