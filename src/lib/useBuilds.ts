import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Build,
  type BuildComponent,
  isBuildActif,
  isBuildHistorique,
} from "@/components/stock/buildsDatasets";
import type { PlatformKey } from "@/components/stock/datasets";
import * as buildsApi from "./api/builds";

export type StockCascadeApi = { refresh: () => Promise<void> };

export function useBuilds(stockApi: StockCascadeApi) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setBuilds(await buildsApi.fetchBuilds());
    } catch {
      /* keep current */
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsert = (b: Build) =>
    setBuilds((prev) => {
      const i = prev.findIndex((x) => x.id === b.id);
      if (i === -1) return [b, ...prev];
      const next = [...prev];
      next[i] = b;
      return next;
    });
  const syncStock = useCallback(async () => {
    try {
      await stockApi.refresh();
    } catch {
      /* noop */
    }
  }, [stockApi]);
  const wrap = async (fn: () => Promise<Build>, cascade = false) => {
    try {
      upsert(await fn());
    } catch {
      await refresh();
    }
    if (cascade) await syncStock();
  };

  const getById = useCallback(
    (id: string): Build | null => builds.find((b) => b.id === id) ?? null,
    [builds],
  );

  const add = useCallback((build: Build) => {
    // legacy : seul l'API crée vraiment ; ici on conserve une insertion locale.
    upsert(build);
  }, []);

  const update = useCallback(
    async (id: string, patch: Partial<Build>) => {
      try {
        upsert(await buildsApi.updateBuild(id, patch));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const createEmpty = useCallback(async (): Promise<Build> => {
    const created = await buildsApi.createBuild();
    upsert(created);
    return created;
  }, []);

  const remove = useCallback(
    async (id: string) => {
      setBuilds((prev) => prev.filter((b) => b.id !== id));
      try {
        await buildsApi.deleteBuild(id);
      } catch {
        await refresh();
      }
      await syncStock();
    },
    [refresh, syncStock],
  );

  const addComponent = useCallback(
    async (buildId: string, component: BuildComponent): Promise<boolean> => {
      try {
        upsert(await buildsApi.addBuildComponent(buildId, component));
        await syncStock();
        return true;
      } catch {
        return false;
      }
    },
    [syncStock],
  );

  const removeComponent = useCallback(
    async (buildId: string, componentId: string) => {
      try {
        upsert(await buildsApi.removeBuildComponent(buildId, componentId));
        await syncStock();
      } catch {
        await refresh();
      }
    },
    [refresh, syncStock],
  );

  const updateComponent = useCallback(
    async (buildId: string, componentId: string, patch: Partial<BuildComponent>) => {
      try {
        upsert(await buildsApi.updateBuildComponent(buildId, componentId, patch));
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const markAsTested = useCallback(
    (id: string) => wrap(() => buildsApi.testBuild(id)),
    [refresh, syncStock],
  );
  const markAsUntested = useCallback(
    (id: string) => wrap(() => buildsApi.untestBuild(id)),
    [refresh, syncStock],
  );
  const markAsListed = useCallback(
    (id: string) => wrap(() => buildsApi.listBuild(id)),
    [refresh, syncStock],
  );
  const markAsDelisted = useCallback(
    (id: string) => wrap(() => buildsApi.unlistBuild(id)),
    [refresh, syncStock],
  );
  const markAsSold = useCallback(
    (
      id: string,
      sale: {
        sale_price_eur: number;
        sale_date: string;
        sale_platform: PlatformKey;
        fees_eur: number;
      },
    ) => wrap(() => buildsApi.sellBuild(id, sale), true),
    [refresh, syncStock],
  );
  const cancelSale = useCallback(
    (id: string, mode: "listed" | "returned") =>
      wrap(() => buildsApi.cancelBuildSale(id, mode), true),
    [refresh, syncStock],
  );
  const markAsFailed = useCallback(
    (id: string) => wrap(() => buildsApi.failBuild(id), true),
    [refresh, syncStock],
  );
  const resumeFromFailed = useCallback(
    (id: string, mode: "reinject" | "keep_pieces") =>
      wrap(() => buildsApi.resumeBuild(id, mode), true),
    [refresh, syncStock],
  );
  const reSellFromReturned = useCallback(
    (id: string) => wrap(() => buildsApi.resellBuild(id)),
    [refresh, syncStock],
  );

  const duplicate = useCallback(async (id: string): Promise<Build | null> => {
    try {
      const clone = await buildsApi.duplicateBuild(id);
      upsert(clone);
      return clone;
    } catch {
      await refresh();
      return null;
    }
  }, [refresh]);

  const actifs = useMemo(() => builds.filter(isBuildActif), [builds]);
  const historique = useMemo(() => builds.filter(isBuildHistorique), [builds]);

  return {
    builds,
    actifs,
    historique,
    loading,
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