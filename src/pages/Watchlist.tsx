import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import FadeInSection from "@/components/ui/FadeInSection";
import { CATALOG_MODELS } from "@/components/catalog/mockData";
import {
  useCatalogFavorites,
  computeMovementDelta,
  MOVEMENT_THRESHOLD_PCT,
} from "@/lib/catalogFavorites";
import WatchlistFilterBar from "@/components/watchlist/WatchlistFilterBar";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import WatchlistCardGrid from "@/components/watchlist/WatchlistCardGrid";
import WatchlistMovementsBanner from "@/components/watchlist/WatchlistMovementsBanner";
import WatchlistDrawer from "@/components/watchlist/WatchlistDrawer";
import {
  DEFAULT_WATCHLIST_FILTERS,
  DEFAULT_SORT_STATE,
  applyWatchlistFilters,
  loadDensity,
  saveDensity,
  type WatchlistFilters,
  type SortState,
  type WatchlistDensity,
} from "@/components/watchlist/datasets";
import type { CatalogModel } from "@/components/catalog/datasets";

export default function Watchlist() {
  const favorites = useCatalogFavorites();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<WatchlistFilters>(DEFAULT_WATCHLIST_FILTERS);
  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT_STATE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [density, setDensity] = useState<WatchlistDensity>(() => loadDensity());

  useEffect(() => {
    saveDensity(density);
  }, [density]);

  useEffect(() => {
    favorites.entries.forEach((entry) => {
      if (entry.snapshot_eur === null) {
        const model = CATALOG_MODELS.find((m) => m.id === entry.id);
        if (model) {
          favorites.backfillSnapshot(entry.id, model.median_eur);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pinnedModels = useMemo<CatalogModel[]>(
    () => CATALOG_MODELS.filter((m) => favorites.ids.includes(m.id)),
    [favorites.ids],
  );

  const significantMovesCount = useMemo(() => {
    let count = 0;
    for (const m of pinnedModels) {
      const entry = favorites.entries.find((e) => e.id === m.id);
      const delta = computeMovementDelta(entry ?? null, m.median_eur);
      if (delta?.isSignificant) count++;
    }
    return count;
  }, [pinnedModels, favorites.entries]);

  const snapshotsByModelId = useMemo(() => {
    const map: Record<string, { snapshot_eur: number | null }> = {};
    for (const entry of favorites.entries) {
      map[entry.id] = { snapshot_eur: entry.snapshot_eur };
    }
    return map;
  }, [favorites.entries]);

  const visibleModels = useMemo(
    () =>
      applyWatchlistFilters(pinnedModels, filters, sortState, snapshotsByModelId),
    [pinnedModels, filters, sortState, snapshotsByModelId],
  );

  const handleToggleFavorite = useCallback(
    (id: string, currentMedian: number) => {
      favorites.toggle(id, currentMedian);
    },
    [favorites],
  );

  const handleSelectRow = useCallback((model: CatalogModel) => {
    setSelectedId(model.id);
  }, []);

  const totalSuivis = favorites.ids.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
              WATCHLIST V1
            </div>
            <div className="h-px w-10 bg-white/10" />
            <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
              MODÈLES ÉPINGLÉS
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-zinc-100 md:text-3xl">
            Watchlist
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Tous les modèles que vous suivez. Évolution des prix calculée depuis
            le moment où vous les avez épinglés.
          </p>
        </div>

        <div className="mk-card-flat-soft flex items-center gap-4 px-4 py-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-600">
              MODÈLES SUIVIS
            </div>
            <div className="font-mono text-lg tabular-nums text-zinc-100">
              {totalSuivis}
            </div>
          </div>
        </div>
      </header>

      {significantMovesCount > 0 && (
        <FadeInSection delay={0}>
          <WatchlistMovementsBanner
            count={significantMovesCount}
            thresholdPct={MOVEMENT_THRESHOLD_PCT}
          />
        </FadeInSection>
      )}

      {totalSuivis > 0 && (
        <FadeInSection delay={60}>
          <WatchlistFilterBar
            filters={filters}
            sortState={sortState}
            density={density}
            onChangeFilters={setFilters}
            onChangeSortState={setSortState}
            onChangeDensity={setDensity}
          />
        </FadeInSection>
      )}

      {totalSuivis === 0 ? (
        <FadeInSection delay={60}>
          <div className="mk-card-flat-soft flex flex-col items-center gap-5 px-6 py-16 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: "rgba(245,158,11,0.10)",
                boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.22)",
              }}
            >
              <Star
                className="h-5 w-5"
                style={{ color: "#F59E0B" }}
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-[15px] font-medium text-zinc-100">
                Aucun modèle épinglé
              </div>
              <div className="max-w-md text-[13px] leading-relaxed text-zinc-400">
                Épinglez des modèles depuis le catalogue pour les suivre ici.
                Monark enregistre le prix au moment de l'épinglage et calcule
                l'évolution en continu.
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/catalogue" })}
              className="ease-expo flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
              style={{ background: "rgba(245,158,11,0.14)" }}
            >
              <span
                className="font-mono text-[12px] tracking-wider"
                style={{ color: "#F59E0B" }}
              >
                PARCOURIR LE CATALOGUE
              </span>
            </button>
          </div>
        </FadeInSection>
      ) : visibleModels.length === 0 ? (
        <FadeInSection delay={120}>
          <div className="mk-card-flat-soft p-8 text-center text-sm text-zinc-500">
            Aucun modèle ne correspond aux filtres actifs.
          </div>
        </FadeInSection>
      ) : (
        <FadeInSection
          key={`${filters.category}_${filters.search}_${density}_${sortState?.column ?? "none"}_${sortState?.direction ?? "none"}`}
          delay={120}
        >
          {density === "cards" ? (
            <WatchlistCardGrid
              models={visibleModels}
              favoriteEntries={favorites.entries}
              onToggleFavorite={handleToggleFavorite}
              onSelectRow={handleSelectRow}
            />
          ) : (
            <WatchlistTable
              models={visibleModels}
              favoriteEntries={favorites.entries}
              density={density}
              sortState={sortState}
              onChangeSortState={setSortState}
              onToggleFavorite={handleToggleFavorite}
              onSelectRow={handleSelectRow}
            />
          )}
        </FadeInSection>
      )}

      <WatchlistDrawer
        models={visibleModels}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        onSelectId={setSelectedId}
      />
    </div>
  );
}