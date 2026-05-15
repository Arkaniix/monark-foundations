import { Search } from "lucide-react";
import DropdownSelect, { type DropdownItem } from "./DropdownSelect";
import {
  BUILDS_SORT_OPTIONS,
  BUILDS_STATUS_TABS,
  type BuildsFilters,
} from "./buildsDatasets";
import { STOCK_DENSITIES, type StockDensity } from "./datasets";

type Props = {
  filters: BuildsFilters;
  density: StockDensity;
  onChangeFilters: (next: BuildsFilters) => void;
  onChangeDensity: (d: StockDensity) => void;
};

export default function StockBuildsFilterBar({
  filters,
  density,
  onChangeFilters,
  onChangeDensity,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex h-[30px] flex-1 min-w-[220px] items-center gap-2 rounded-md px-3"
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
          placeholder="Rechercher un build…"
          className="flex-1 bg-transparent text-[12.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>

      <div
        className="flex h-[30px] items-center gap-0.5 rounded-md p-[2px]"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {BUILDS_STATUS_TABS.map((tab) => {
          const active = tab.key === filters.status;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeFilters({ ...filters, status: tab.key })}
              className="ease-expo rounded-[4px] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors"
              style={{
                background: active ? "#27272A" : "transparent",
                color: active ? tab.color ?? "#FAFAFA" : "#71717A",
                boxShadow:
                  active && tab.color ? `inset 0 0 0 1px ${tab.color}` : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <DropdownSelect
        value={filters.sort}
        label={
          BUILDS_SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? ""
        }
        items={BUILDS_SORT_OPTIONS.map<DropdownItem<typeof filters.sort>>(
          (o) => ({ type: "option", value: o.key, label: o.label }),
        )}
        onChange={(sort) => onChangeFilters({ ...filters, sort })}
        minWidth={130}
      />

      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-600">
          DENSITÉ
        </span>
        <div
          className="flex h-[30px] items-center gap-0.5 rounded-md p-[2px]"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {STOCK_DENSITIES.map((opt) => {
            const active = opt.key === density;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChangeDensity(opt.key)}
                className="ease-expo rounded-[4px] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors"
                style={{
                  background: active ? "#27272A" : "transparent",
                  color: active ? "#F4F4F5" : "#71717A",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}