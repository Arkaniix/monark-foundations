import { Search } from "lucide-react";
import {
  type StockFilters,
  type StockDensity,
  type StockCategoryFilter,
  STOCK_SORT_OPTIONS,
  STOCK_DENSITIES,
} from "./datasets";
import { HARDWARE_CATEGORIES } from "@/components/catalog/datasets";
import DropdownSelect, { type DropdownItem } from "./DropdownSelect";

type Props = {
  filters: StockFilters;
  density: StockDensity;
  onChangeFilters: (next: StockFilters) => void;
  onChangeDensity: (next: StockDensity) => void;
};

const CATEGORY_OPTIONS: Array<{ key: StockCategoryFilter; label: string }> = [
  { key: "ALL", label: "TOUS" },
  ...HARDWARE_CATEGORIES.map((c) => ({ key: c as StockCategoryFilter, label: c })),
  { key: "OTHER", label: "OTHER" },
];

export default function StockFilterBar({
  filters,
  density,
  onChangeFilters,
  onChangeDensity,
}: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <div
          className="flex items-center gap-2 rounded-md px-3 py-2 lg:w-[280px]"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <Search className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              onChangeFilters({ ...filters, search: e.target.value })
            }
            placeholder="Rechercher un modèle…"
            className="flex-1 bg-transparent text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <div
          className="flex flex-wrap items-center gap-1 rounded-md p-1"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {CATEGORY_OPTIONS.map((opt) => {
            const isActive = opt.key === filters.category;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  onChangeFilters({ ...filters, category: opt.key })
                }
                className="ease-expo rounded-[4px] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors"
                style={{
                  background: isActive ? "#27272A" : "transparent",
                  color: isActive ? "#FAFAFA" : "#71717A",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownSelect
          value={filters.sort}
          label={
            STOCK_SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? ""
          }
          items={STOCK_SORT_OPTIONS.map<DropdownItem<typeof filters.sort>>((o) => ({
            type: "option",
            value: o.key,
            label: o.label,
          }))}
          onChange={(sort) => onChangeFilters({ ...filters, sort })}
          minWidth={120}
        />

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-600">
            DENSITÉ
          </span>
          <div
            className="flex items-center gap-1 rounded-md p-1"
            style={{
              background: "rgba(255,255,255,0.02)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {STOCK_DENSITIES.map((opt) => {
              const isActive = opt.key === density;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChangeDensity(opt.key)}
                  className="ease-expo rounded-[4px] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors"
                  style={{
                    background: isActive ? "#27272A" : "transparent",
                    color: isActive ? "#F4F4F5" : "#71717A",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}