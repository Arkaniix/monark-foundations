import { useCallback, useEffect, useMemo, useState } from "react";
import FadeInSection from "@/components/ui/FadeInSection";
import { CATALOG_MODELS } from "@/components/catalog/mockData";
import { useCatalogFavorites } from "@/lib/catalogFavorites";
import {
  useCatalogAlerts,
  computeAlertDelta,
  ALERT_THRESHOLD_PCT,
} from "@/lib/catalogAlerts";
import WatchlistTabs from "@/components/watchlist/WatchlistTabs";
import WatchlistFilterBar from "@/components/watchlist/WatchlistFilterBar";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import WatchlistEmptyState from "@/components/watchlist/WatchlistEmptyState";
import WatchlistAlertsBanner from "@/components/watchlist/WatchlistAlertsBanner";
import {
  DEFAULT_WATCHLIST_FILTERS,
  DEFAULT_WATCHLIST_SORT,
  applyWatchlistFilters,
  type WatchlistFilters,
  type WatchlistSortKey,
  type WatchlistTabKey,
} from "@/components/watchlist/datasets";
import type { CatalogModel } from "@/components/catalog/datasets";

export default function Watchlist() {
  const favorites = useCatalogFavorites();
  const alerts = useCatalogAlerts();
  const [tab, setTab] = useState<WatchlistTabKey>("favorites");
  const [filters, setFilters] = useState<WatchlistFilters>(DEFAULT_WATCHLIST_FILTERS);
  const [sort, setSort] = useState<WatchlistSortKey>(DEFAULT_WATCHLIST_SORT);

  // Hydratation des snapshots null (migrés depuis v1) au mount uniquement.
  useEffect(() => {
    alerts.entries.forEach((entry) => {
      if (entry.snapshot_eur === null) {
        const model = CATALOG_MODELS.find((m) => m.id === entry.id);
        if (model) {
          alerts.backfillSnapshot(entry.id, model.median_eur);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const favoritesModels = useMemo(
    () => CATALOG_MODELS.filter((m) => favorites.ids.includes(m.id)),
    [favorites.ids],
  );
  const alertsModels = useMemo(
    () => CATALOG_MODELS.filter((m) => alerts.ids.includes(m.id)),
    [alerts.ids],
  );

  const significantMovesCount = useMemo(() => {
    let count = 0;
    for (const m of alertsModels) {
      const entry = alerts.entries.find((e) => e.id === m.id);
      const delta = computeAlertDelta(entry ?? null, m.median_eur);
      if (delta?.isSignificant) count++;
    }
    return count;
  }, [alertsModels, alerts.entries]);

  const visibleModels = useMemo(() => {
    const base = tab === "favorites" ? favoritesModels : alertsModels;
    return applyWatchlistFilters(base, filters, sort);
  }, [tab, favoritesModels, alertsModels, filters, sort]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      favorites.toggle(id);
    },
    [favorites],
  );

  const handleToggleAlert = useCallback(
    (id: string, currentMedian: number) => {
      alerts.toggle(id, currentMedian);
    },
    [alerts],
  );

  const handleSelectRow = useCallback((_model: CatalogModel) => {
    // P3 : ouvrira le drawer. Pour l'instant, no-op.
  }, []);

  const totalSuivis = favorites.ids.length + alerts.ids.length;
  const totalUniques = new Set([...favorites.ids, ...alerts.ids]).size;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
              WATCHLIST V1
            </div>
            <div className="h-px w-10 bg-white/10" />
            <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
              MODÈLES SUIVIS
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-zinc-100 md:text-3xl">
            Watchlist
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-500">
            Modèles épinglés et alertés. Suivez les mouvements de prix sans
            rouvrir le catalogue.
          </p>
        </div>

        <div
          className="rounded-md px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">
            MODÈLES SUIVIS
          </div>
          <div className="mt-1 font-mono text-[20px] tabular-nums text-zinc-100">
            {totalUniques}
            <span className="ml-2 font-mono text-[10.5px] tracking-[0.06em] text-zinc-600">
              / {totalSuivis} entrées
            </span>
          </div>
        </div>
      </header>

      <FadeInSection delay={0}>
        <WatchlistTabs
          active={tab}
          favoritesCount={favorites.ids.length}
          alertsCount={alerts.ids.length}
          significantMovesCount={significantMovesCount}
          onChange={(t) => setTab(t)}
        />
      </FadeInSection>

      {tab === "alerts" && significantMovesCount > 0 && (
        <FadeInSection delay={40}>
          <WatchlistAlertsBanner
            count={significantMovesCount}
            thresholdPct={ALERT_THRESHOLD_PCT}
          />
        </FadeInSection>
      )}

      <FadeInSection delay={80}>
        <WatchlistFilterBar
          filters={filters}
          sort={sort}
          onChangeFilters={setFilters}
          onChangeSort={setSort}
        />
      </FadeInSection>

      {(tab === "favorites" ? favorites.ids.length : alerts.ids.length) === 0 ? (
        <FadeInSection delay={120}>
          <WatchlistEmptyState tab={tab} />
        </FadeInSection>
      ) : visibleModels.length === 0 ? (
        <FadeInSection delay={120}>
          <div className="mk-card-flat-soft flex items-center justify-center px-6 py-12">
            <p className="text-sm text-zinc-500">
              Aucun modèle ne correspond aux filtres actifs.
            </p>
          </div>
        </FadeInSection>
      ) : (
        <FadeInSection delay={120}>
          <WatchlistTable
            tab={tab}
            models={visibleModels}
            favoriteIds={favorites.ids}
            alertEntries={alerts.entries}
            onToggleFavorite={(id, _med) => handleToggleFavorite(id)}
            onToggleAlert={handleToggleAlert}
            onSelectRow={handleSelectRow}
          />
        </FadeInSection>
      )}
    </div>
  );
}