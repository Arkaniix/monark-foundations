import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { catalogApi } from "@/lib/api";
import FadeInSection from "@/components/ui/FadeInSection";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import { getAvailableFacets, getCategoryCounts } from "@/components/catalog/filters";
import CatalogCategoryTabs from "@/components/catalog/CatalogCategoryTabs";
import CatalogFilterBar from "@/components/catalog/CatalogFilterBar";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import { useCatalogFavorites } from "@/lib/catalogFavorites";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  type CatalogFilters,
  type CatalogListResponse,
  type CatalogModel,
  type CatalogSortKey,
} from "@/components/catalog/datasets";

type CatalogState =
  | { status: "loading" }
  | { status: "success"; data: CatalogListResponse }
  | { status: "error"; message: string };

export default function Catalog() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<CatalogSortKey>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<CatalogState>({ status: "loading" });
  const [allModels, setAllModels] = useState<CatalogModel[]>([]);
  const favorites = useCatalogFavorites();

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getAllModels()
      .then((m) => { if (!cancelled) setAllModels(m); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const facets = useMemo(
    () => getAvailableFacets(allModels, filters.category),
    [allModels, filters.category],
  );
  const counts = useMemo(() => getCategoryCounts(allModels), [allModels]);

  const gridKey = useMemo(
    () => `${JSON.stringify(filters)}_${sort}_${page}`,
    [filters, sort, page],
  );

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    catalogApi
      .listModels(filters, sort, page)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Erreur de chargement",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filters, page, sort]);

  const handleChangeFilters = (next: CatalogFilters) => {
    setPage(1);
    setFilters(next);
  };

  const handleChangeSort = (next: CatalogSortKey) => {
    setPage(1);
    setSort(next);
  };

  const handleReset = () => {
    setPage(1);
    setFilters({ ...DEFAULT_FILTERS, category: filters.category });
    setSort(DEFAULT_SORT);
  };

  const handleChangeCategory = (cat: CatalogFilters["category"]) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      category: cat,
      manufacturer: "ALL",
      brand: "ALL",
      family: "ALL",
    }));
  };

  const handleOpenDetails = useCallback(
    (model: CatalogModel) => {
      navigate({ to: "/catalogue/$modelId", params: { modelId: model.id } });
    },
    [navigate],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
              CATALOGUE V1
            </div>
            <div className="h-px w-10 bg-white/10" />
            <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
              AGRÉGATEUR MARCHÉ
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-zinc-100 md:text-3xl">
            Catalogue composants
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Scores d'opportunité, liquidité, tendance 30 jours et prix médian par modèle hardware.
          </p>
        </div>

        <div className="mk-card-flat-soft flex items-center gap-3 px-4 py-3">
          <TrendingUp className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-600">
              MODÈLES INDEXÉS
            </div>
            <div className="font-mono text-lg tabular-nums text-zinc-100">
              {allModels.length}
            </div>
          </div>
        </div>
      </header>

      <FadeInSection delay={0}>
        <CatalogCategoryTabs
          active={filters.category}
          counts={counts}
          onChange={handleChangeCategory}
        />
      </FadeInSection>

      <FadeInSection delay={60}>
        <CatalogFilterBar
          filters={filters}
          sort={sort}
          facets={facets}
          onChangeFilters={handleChangeFilters}
          onChangeSort={handleChangeSort}
          onReset={handleReset}
        />
      </FadeInSection>

      {state.status === "error" && (
        <div className="mk-card-flat-soft p-6 text-sm text-zinc-400">
          Impossible de charger le catalogue : {state.message}
        </div>
      )}

      {state.status === "loading" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="mk-card-flat-soft h-[360px] animate-pulse" />
          ))}
        </div>
      )}

      {state.status === "success" && (
        <>
          <FadeInSection key={`meta_${gridKey}`} delay={120}>
            <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.12em] text-zinc-600">
              <span>{state.data.total} RÉSULTATS</span>
              <span>
                PAGE {state.data.page} / {state.data.total_pages}
              </span>
            </div>
          </FadeInSection>

          {state.data.models.length === 0 ? (
            <div className="mk-card-flat-soft p-8 text-center text-sm text-zinc-500">
              Aucun modèle ne correspond aux filtres actifs.
            </div>
          ) : (
            <CatalogGrid
              gridKey={gridKey}
              models={state.data.models}
              favoriteIds={favorites.ids}
              onToggleFavorite={(id) => {
                const model = state.data.models.find((m) => m.id === id);
                favorites.toggle(id, model?.median_eur);
              }}
              onOpenDetails={handleOpenDetails}
            />
          )}

          <FadeInSection key={`pagi_${gridKey}`} delay={240}>
            <CatalogPagination
              page={state.data.page}
              totalPages={state.data.total_pages}
              onChangePage={setPage}
            />
          </FadeInSection>
        </>
      )}
    </div>
  );
}