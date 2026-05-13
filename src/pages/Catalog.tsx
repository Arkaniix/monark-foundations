import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import { catalogApi } from "@/lib/api";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import { getAvailableFacets, getCategoryCounts } from "@/components/catalog/filters";
import { CATALOG_MODELS } from "@/components/catalog/mockData";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  HARDWARE_CATEGORIES,
  SORT_OPTIONS,
  type CatalogFilters,
  type CatalogListResponse,
  type CatalogModel,
  type CatalogSortKey,
  type HardwareCategory,
  type Manufacturer,
} from "@/components/catalog/datasets";

type CatalogState =
  | { status: "loading" }
  | { status: "success"; data: CatalogListResponse }
  | { status: "error"; message: string };

export default function Catalog() {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<CatalogSortKey>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<CatalogState>({ status: "loading" });

  const facets = useMemo(
    () => getAvailableFacets(CATALOG_MODELS, filters.category),
    [filters.category],
  );
  const counts = useMemo(() => getCategoryCounts(CATALOG_MODELS), []);

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

  const patchFilters = (next: Partial<CatalogFilters>) => {
    setPage(1);
    setFilters((current) => ({ ...current, ...next }));
  };

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
              {CATALOG_MODELS.length}
            </div>
          </div>
        </div>
      </header>

      <section className="mk-card-flat-soft p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {HARDWARE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    patchFilters({
                      category,
                      manufacturer: "ALL",
                      brand: "ALL",
                      family: "ALL",
                    })
                  }
                  className="ease-expo rounded-md border px-3 py-2 font-mono text-[11px] transition-colors"
                  style={{
                    background:
                      filters.category === category
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(255,255,255,0.025)",
                    borderColor:
                      filters.category === category
                        ? "rgba(59,130,246,0.45)"
                        : "rgba(255,255,255,0.08)",
                    color: filters.category === category ? "#93C5FD" : "#a1a1aa",
                  }}
                >
                  {category} <span className="text-zinc-600">{counts[category] ?? 0}</span>
                </button>
              ))}
            </div>

            <label className="relative block min-w-0 xl:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <input
                value={filters.search}
                onChange={(event) => patchFilters({ search: event.target.value })}
                placeholder="Rechercher un modèle…"
                className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-blue-500/50"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <SelectFacet
              label="Fabricant"
              value={filters.manufacturer}
              options={facets.manufacturers}
              onChange={(value) => patchFilters({ manufacturer: value as Manufacturer | "ALL" })}
            />
            <SelectFacet
              label="Marque"
              value={filters.brand}
              options={facets.brands}
              onChange={(value) => patchFilters({ brand: value })}
            />
            <SelectFacet
              label="Famille"
              value={filters.family}
              options={facets.families}
              onChange={(value) => patchFilters({ family: value })}
            />
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-zinc-600">
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} /> TRI
              </span>
              <select
                value={sort}
                onChange={(event) => {
                  setPage(1);
                  setSort(event.target.value as CatalogSortKey);
                }}
                className="h-10 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none focus:border-blue-500/50"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {state.status === "error" && (
        <div className="mk-card-flat-soft p-6 text-sm text-zinc-400">
          Impossible de charger le catalogue : {state.message}
        </div>
      )}

      {state.status === "loading" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="mk-card-flat-soft h-48 animate-pulse" />
          ))}
        </div>
      )}

      {state.status === "success" && (
        <>
          <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.12em] text-zinc-600">
            <span>{state.data.total} RÉSULTATS</span>
            <span>
              PAGE {state.data.page} / {state.data.total_pages}
            </span>
          </div>

          {state.data.models.length === 0 ? (
            <div className="mk-card-flat-soft p-8 text-center text-sm text-zinc-500">
              Aucun modèle ne correspond aux filtres actifs.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {state.data.models.map((model) => (
                <CatalogModelCard key={model.id} model={model} />
              ))}
            </div>
          )}

          <CatalogPagination
            page={state.data.page}
            totalPages={state.data.total_pages}
            onChangePage={setPage}
          />
        </>
      )}
    </div>
  );
}

type SelectFacetProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string | "ALL") => void;
};

function SelectFacet({ label, value, options, onChange }: SelectFacetProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">
        {label.toUpperCase()}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none focus:border-blue-500/50"
      >
        <option value="ALL">Tous</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CatalogModelCard({ model }: { model: CatalogModel }) {
  const trendPositive = model.trend_30d_pct >= 0;
  return (
    <article className="mk-card-flat-soft flex min-h-48 flex-col justify-between p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-zinc-500">
              {model.category}
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
              {model.family}
            </span>
          </div>
          <h2 className="truncate text-base font-medium tracking-normal text-zinc-100">
            {model.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {model.manufacturer}{model.brand ? ` · ${model.brand}` : ""}
          </p>
        </div>
        <div className="rounded-md border border-white/10 px-2.5 py-2 text-center">
          <div className="font-mono text-[10px] text-zinc-600">SCORE</div>
          <div className="font-mono text-lg tabular-nums text-zinc-100">{model.score}</div>
        </div>
      </div>

      <Sparkline values={model.sparkline_30d} positive={trendPositive} />

      <div className="grid grid-cols-4 gap-2 border-t border-white/10 pt-3">
        <Metric label="MÉDIAN" value={`${model.median_eur}€`} />
        <Metric
          label="30J"
          value={`${trendPositive ? "+" : ""}${model.trend_30d_pct.toFixed(1)}%`}
        />
        <Metric label="LIQ." value={`${model.liquidity_pct}%`} />
        <Metric label="MARGE" value={`${model.margin_pct}%`} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.12em] text-zinc-600">{label}</div>
      <div className="mt-1 font-mono text-[12px] tabular-nums text-zinc-300">{value}</div>
    </div>
  );
}

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 180;
      const y = 42 - ((value - min) / span) * 32;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 180 48" className="my-4 h-12 w-full" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#10B981" : "#EF4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}