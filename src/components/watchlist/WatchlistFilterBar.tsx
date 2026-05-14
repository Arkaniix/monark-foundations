import { Search, ChevronDown } from "lucide-react";
import { HARDWARE_CATEGORIES, CATEGORY_LABELS } from "../catalog/datasets";
import {
  WATCHLIST_SORT_OPTIONS,
  type WatchlistFilters,
  type WatchlistSortKey,
  type WatchlistFilterCategory,
} from "./datasets";

type Props = {
  filters: WatchlistFilters;
  sort: WatchlistSortKey;
  onChangeFilters: (next: WatchlistFilters) => void;
  onChangeSort: (next: WatchlistSortKey) => void;
};

export default function WatchlistFilterBar({
  filters,
  sort,
  onChangeFilters,
  onChangeSort,
}: Props) {
  const setCategory = (cat: WatchlistFilterCategory) =>
    onChangeFilters({ ...filters, category: cat });

  const allCategories: WatchlistFilterCategory[] = ["ALL", ...HARDWARE_CATEGORIES];

  return (
    <div className="mk-card-flat-soft flex flex-wrap items-center gap-3 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {allCategories.map((cat) => {
          const isActive = filters.category === cat;
          const label = cat === "ALL" ? "TOUS" : CATEGORY_LABELS[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={isActive}
              className="ease-expo rounded-md border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] transition-colors"
              style={{
                background: isActive ? "var(--mk-surface-2)" : "transparent",
                borderColor: isActive ? "#3F3F46" : "#27272A",
                color: isActive ? "#D4D4D8" : "#A1A1AA",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
          TRI
        </span>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value as WatchlistSortKey)}
            className="ease-expo appearance-none rounded-md border border-white/10 bg-white/[0.02] py-1.5 pl-3 pr-8 font-mono text-[11.5px] text-zinc-200 outline-none transition-colors hover:bg-white/[0.04]"
          >
            {WATCHLIST_SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-600"
            strokeWidth={1.5}
          />
        </div>
      </div>

      <div className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 sm:w-[260px]">
        <Search className="h-3.5 w-3.5 text-zinc-600" strokeWidth={1.5} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChangeFilters({ ...filters, search: e.target.value })}
          placeholder="Rechercher…"
          className="w-full bg-transparent font-mono text-[11.5px] text-zinc-200 outline-none placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}