import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStockItems } from "@/lib/useStockItems";
import { useCatalogModelMap } from "@/lib/useCatalogModelMap";
import { buildDashboardModel, type DashboardModel } from "@/components/dashboard/dashboardModel";

export function useDashboardData(): { loading: boolean; model: DashboardModel | null; refresh: () => void } {
  const { user } = useAuth();
  const { items, loading: stockLoading, refresh } = useStockItems();
  const { byId, loaded: catalogLoaded } = useCatalogModelMap();
  const loading = stockLoading || !catalogLoaded;
  const model = useMemo(() => {
    if (loading) return null;
    const models = Array.from(byId.values());
    return buildDashboardModel(items, byId, models, new Date(), user?.credits_remaining ?? 0, user?.subscription_tier ?? "free");
  }, [loading, items, byId, user]);
  return { loading, model, refresh };
}
