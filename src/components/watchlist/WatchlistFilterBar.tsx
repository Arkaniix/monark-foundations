import { Search } from "lucide-react";
import { HARDWARE_CATEGORIES, CATEGORY_LABELS } from "../catalog/datasets";
import {
  WATCHLIST_SORT_OPTIONS,
  sortStateToOptionKey,
  type WatchlistFilters,
  type SortState,
  type WatchlistFilterCategory,
  type WatchlistDensity,
} from "./datasets";
import WatchlistDensityToggle from "./WatchlistDensityToggle";
import FilterPill from "../ui/FilterPill";

type Props = {
  filters: WatchlistFilters;
  sortState: SortState;
  density: WatchlistDensity;
  onChangeFilters: (next: WatchlistFilters) => void;
  onChangeSortState: (next: SortState) => void;
  onChangeDensity: (next: WatchlistDensity) => void;
};

export default function WatchlistFilterBar({
  filters,
  sortState,
  density,
  onChangeFilters,
  onChangeSortState,
  onChangeDensity,
}: Props) {
  const setCategory = (cat: WatchlistFilterCategory) =>
    onChangeFilters({ ...filters, category: cat });

  const allCategories: WatchlistFilterCategory[] = ["ALL", ...HARDWARE_CATEGORIES];

  const selectedKey = sortStateToOptionKey(sortState);

  const handleSortDropdownChange = (optionKey: string) => {
    const opt = WATCHLIST_SORT_OPTIONS.find((o) => o.key === optionKey);
    if (opt) onChangeSortState(opt.state);
  };

  return (
    <div className="mk-card-flat-soft flex flex-wrap items-center gap-3 p-3">
      <div className="flex flex-wrap items-center gap-1">
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

      <div className="flex-1" />

      <WatchlistDensityToggle value={density} onChange={onChangeDensity} />

      {density === "cards" && (
        <div className="flex items-center gap-2">
          <FilterPill
            label="TRI"
            value={selectedKey}
            options={WATCHLIST_SORT_OPTIONS.map((o) => ({ value: o.key, label: o.label }))}
            onChange={handleSortDropdownChange}
          />
        </div>
      )}

      <div className="flex min-w-[220px] items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5">
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
