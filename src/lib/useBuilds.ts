import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Build,
  type BuildComponent,
  type BuildStatus,
  generateBuildShortId,
  isBuildActif,
  isBuildHistorique,
  newBuildComponentId,
  newBuildEvent,
  newBuildId,
} from "@/components/stock/buildsDatasets";
import type { PlatformKey, StockItem } from "@/components/stock/datasets";
import { newStockEvent } from "@/components/stock/datasets";

const KEY_V1 = "monark.builds.v1";

function load(): Build[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_V1);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Build =>
        b != null &&
        typeof b === "object" &&
        typeof b.id === "string" &&
        typeof b.short_id === "string" &&
        typeof b.name === "string" &&
        typeof b.status === "string" &&
        Array.isArray(b.components) &&
        Array.isArray(b.events),
    );
  } catch {
    return [];
  }
}

function save(builds: Build[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_V1, JSON.stringify(builds));
  } catch {
    /* noop */
  }
}

/**
 * API minimale d'accès aux items stock — passée par Stock.tsx pour
 * orchestrer la cascade Build ↔ StockItem.
 */
export type StockCascadeApi = {
  getById: (id: string) => StockItem | null;
  update: (id: string, patch: Partial<StockItem>) => void;
};

export function useBuilds(stockApi: StockCascadeApi) {
  const [builds, setBuilds] = useState<Build[]>(() => load());

  useEffect(() => {
    save(builds);
  }, [builds]);

  const getById = useCallback(
    (id: string): Build | null => builds.find((b) => b.id === id) ?? null,
    [builds],
  );

  const add = useCallback((build: Build) => {
    setBuilds((prev) => [build, ...prev]);
  }, []);

  const update = useCallback((id: string, patch: Partial<Build>) => {
    setBuilds((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  /**
   * Création drawer-first : crée un build vide et retourne son id.
   */
  const createEmpty = useCallback((): Build => {
    const now = new Date().toISOString();
    let created: Build | null = null;
    setBuilds((prev) => {
      const short = generateBuildShortId(prev);
      const name = `Build #${prev.length + 1}`;
      const b: Build = {
        id: newBuildId(),
        short_id: short,
        name,
        status: "in_progress",
        components: [],
        expected_sale_price_eur: null,
        sale_price_eur: null,
        sale_date: null,
        sale_platform: null,
        fees_eur: null,
        notes: null,
        events: [{ type: "created", at: now }],
        created_at: now,
      };
      created = b;
      return [b, ...prev];
    });
    return created!;
  }, []);

  const remove = useCallback(
    (id: string) => {
      setBuilds((prev) => {
        const target = prev.find((b) => b.id === id);
        if (target) {
          // Libère les items stock rattachés
          for (const c of target.components) {
            if (c.kind === "stock_item" && c.stock_item_id) {
              stockApi.update(c.stock_item_id, { build_id: null });
            }
          }
        }
        return prev.filter((b) => b.id !== id);
      });
    },
    [stockApi],
  );

  // -------------------------------------------------------------------------
  // Composants
  // -------------------------------------------------------------------------

  /**
   * Ajoute un composant. Si stock_item, vérifie qu'il n'est pas déjà rattaché.
   * Renvoie true si ajouté, false si refusé.
   */
  const addComponent = useCallback(
    (buildId: string, component: BuildComponent): boolean => {
      if (component.kind === "stock_item" && component.stock_item_id) {
        const item = stockApi.getById(component.stock_item_id);
        if (!item) return false;
        if (item.build_id && item.build_id !== buildId) return false;
        stockApi.update(component.stock_item_id, { build_id: buildId });
      }
      setBuilds((prev) =>
        prev.map((b) =>
          b.id === buildId
            ? {
                ...b,
                components: [...b.components, component],
                events: [
                  ...b.events,
                  newBuildEvent("component_added", {
                    component_label: component.label,
                    component_kind: component.kind,
                  }),
                ],
              }
            : b,
        ),
      );
      return true;
    },
    [stockApi],
  );

  const removeComponent = useCallback(
    (buildId: string, componentId: string) => {
      setBuilds((prev) =>
        prev.map((b) => {
          if (b.id !== buildId) return b;
          const comp = b.components.find((c) => c.id === componentId);
          if (comp?.kind === "stock_item" && comp.stock_item_id) {
            stockApi.update(comp.stock_item_id, { build_id: null });
          }
          return {
            ...b,
            components: b.components.filter((c) => c.id !== componentId),
            events: [
              ...b.events,
              newBuildEvent("component_removed", {
                component_label: comp?.label,
                component_kind: comp?.kind,
              }),
            ],
          };
        }),
      );
    },
    [stockApi],
  );

  const updateComponent = useCallback(
    (buildId: string, componentId: string, patch: Partial<BuildComponent>) => {
      setBuilds((prev) =>
        prev.map((b) =>
          b.id === buildId
            ? {
                ...b,
                components: b.components.map((c) =>
                  c.id === componentId ? { ...c, ...patch } : c,
                ),
              }
            : b,
        ),
      );
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Transitions
  // -------------------------------------------------------------------------

  const transition = useCallback(
    (buildId: string, patch: Partial<Build>, eventType: Parameters<typeof newBuildEvent>[0], payload?: Parameters<typeof newBuildEvent>[1]) => {
      setBuilds((prev) =>
        prev.map((b) =>
          b.id === buildId
            ? { ...b, ...patch, events: [...b.events, newBuildEvent(eventType, payload)] }
            : b,
        ),
      );
    },
    [],
  );

  const markAsTested = useCallback(
    (buildId: string) => transition(buildId, { status: "tested" }, "tested"),
    [transition],
  );

  const markAsUntested = useCallback(
    (buildId: string) =>
      transition(buildId, { status: "in_progress" }, "untested"),
    [transition],
  );

  const markAsListed = useCallback(
    (buildId: string) => transition(buildId, { status: "listed" }, "listed"),
    [transition],
  );

  const markAsDelisted = useCallback(
    (buildId: string) => transition(buildId, { status: "tested" }, "delisted"),
    [transition],
  );

  const markAsSold = useCallback(
    (
      buildId: string,
      sale: {
        sale_price_eur: number;
        sale_date: string;
        sale_platform: PlatformKey;
        fees_eur: number;
      },
    ) => {
      // Cascade items composants → status sold à 0 €
      const target = builds.find((b) => b.id === buildId);
      if (target) {
        for (const c of target.components) {
          if (c.kind === "stock_item" && c.stock_item_id) {
            stockApi.update(c.stock_item_id, {
              status: "sold",
              sale_price_eur: 0,
              sale_date: sale.sale_date,
              sale_platform: sale.sale_platform,
              fees_eur: 0,
            });
          }
        }
      }
      transition(
        buildId,
        {
          status: "sold",
          sale_price_eur: sale.sale_price_eur,
          sale_date: sale.sale_date,
          sale_platform: sale.sale_platform,
          fees_eur: sale.fees_eur,
        },
        "sold",
        {
          sale_price_eur: sale.sale_price_eur,
          sale_platform: sale.sale_platform,
          fees_eur: sale.fees_eur,
        },
      );
    },
    [builds, stockApi, transition],
  );

  const cancelSale = useCallback(
    (buildId: string, newStatus: "listed" | "returned") => {
      const target = builds.find((b) => b.id === buildId);
      if (newStatus === "listed" && target) {
        // Items composants reviennent in_stock
        for (const c of target.components) {
          if (c.kind === "stock_item" && c.stock_item_id) {
            stockApi.update(c.stock_item_id, {
              status: "in_stock",
              sale_price_eur: null,
              sale_date: null,
              sale_platform: null,
              fees_eur: null,
            });
          }
        }
        transition(
          buildId,
          {
            status: "listed",
            sale_price_eur: null,
            sale_date: null,
            sale_platform: null,
            fees_eur: null,
          },
          "sale_cancelled",
        );
      } else {
        // Returned : on garde sale_price_eur, items composants restent sold à 0 €
        transition(buildId, { status: "returned" }, "returned");
      }
    },
    [builds, stockApi, transition],
  );

  const markAsFailed = useCallback(
    (buildId: string) => {
      const target = builds.find((b) => b.id === buildId);
      const today = new Date().toISOString().slice(0, 10);
      if (target) {
        for (const c of target.components) {
          if (c.kind === "stock_item" && c.stock_item_id) {
            stockApi.update(c.stock_item_id, {
              status: "sold",
              sale_price_eur: 0,
              sale_date: today,
              sale_platform: null,
              fees_eur: 0,
            });
          }
        }
      }
      transition(buildId, { status: "failed" }, "failed");
    },
    [builds, stockApi, transition],
  );

  const resumeFromFailed = useCallback(
    (buildId: string, mode: "reinject" | "keep_pieces") => {
      const target = builds.find((b) => b.id === buildId);
      if (mode === "reinject" && target) {
        for (const c of target.components) {
          if (c.kind === "stock_item" && c.stock_item_id) {
            stockApi.update(c.stock_item_id, {
              status: "in_stock",
              sale_price_eur: null,
              sale_date: null,
              sale_platform: null,
              fees_eur: null,
            });
          }
        }
      }
      transition(buildId, { status: "in_progress" }, "resumed");
    },
    [builds, stockApi, transition],
  );

  const reSellFromReturned = useCallback(
    (buildId: string) => {
      transition(buildId, { status: "sold" }, "sold");
    },
    [transition],
  );

  const duplicate = useCallback(
    (buildId: string): Build | null => {
      const source = builds.find((b) => b.id === buildId);
      if (!source) return null;
      const now = new Date().toISOString();
      let created: Build | null = null;
      setBuilds((prev) => {
        const short = generateBuildShortId(prev);
        const clonedComponents: BuildComponent[] = source.components.map((c) => {
          if (c.kind === "stock_item") {
            return {
              id: newBuildComponentId(),
              kind: "owned_no_cost",
              stock_item_id: null,
              label: c.label,
              category_snapshot: c.category_snapshot,
              purchase_price_eur: 0,
              notes: c.notes,
              added_at: now,
            };
          }
          return {
            ...c,
            id: newBuildComponentId(),
            added_at: now,
          };
        });
        const clone: Build = {
          id: newBuildId(),
          short_id: short,
          name: `${source.name} (copie)`,
          status: "in_progress",
          components: clonedComponents,
          expected_sale_price_eur: source.expected_sale_price_eur,
          sale_price_eur: null,
          sale_date: null,
          sale_platform: null,
          fees_eur: null,
          notes: source.notes,
          events: [
            { type: "created", at: now },
            {
              type: "duplicated",
              at: now,
              payload: { source_build_id: source.id },
            },
          ],
          created_at: now,
        };
        created = clone;
        return [clone, ...prev];
      });
      return created;
    },
    [builds],
  );

  const actifs = useMemo(() => builds.filter(isBuildActif), [builds]);
  const historique = useMemo(() => builds.filter(isBuildHistorique), [builds]);

  return {
    builds,
    actifs,
    historique,
    add,
    update,
    remove,
    getById,
    createEmpty,
    addComponent,
    removeComponent,
    updateComponent,
    markAsTested,
    markAsUntested,
    markAsListed,
    markAsDelisted,
    markAsSold,
    cancelSale,
    markAsFailed,
    resumeFromFailed,
    reSellFromReturned,
    duplicate,
  };
}

export type UseBuildsReturn = ReturnType<typeof useBuilds>;