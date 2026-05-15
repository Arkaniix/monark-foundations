import { Search } from "lucide-react";
import {
  ACCOUNTING_CATEGORIES_META,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  KIND_COLOR,
  type AccountingCategory,
  type AccountingFilters,
  type AccountingKind,
  type AccountingViewMode,
} from "./accountingDatasets";

type Props = {
  filters: AccountingFilters;
  viewMode: AccountingViewMode;
  onChangeFilters: (next: AccountingFilters) => void;
  onChangeViewMode: (next: AccountingViewMode) => void;
};

const SORT_OPTIONS: Array<{ key: AccountingFilters["sort"]; label: string }> = [
  { key: "date_desc", label: "Date ↓" },
  { key: "date_asc", label: "Date ↑" },
  { key: "amount_desc", label: "Montant ↓" },
  { key: "amount_asc", label: "Montant ↑" },
];

export default function StockComptesFilterBar({
  filters,
  viewMode,
  onChangeFilters,
  onChangeViewMode,
}: Props) {
  const setKind = (k: "all" | AccountingKind) => {
    if (k === filters.kind) return;
    // si le kind change, reset la catégorie si elle ne match plus
    let category = filters.category;
    if (k !== "all" && category !== "all") {
      const meta = ACCOUNTING_CATEGORIES_META[category as AccountingCategory];
      if (meta.kind !== k) category = "all";
    }
    onChangeFilters({ ...filters, kind: k, category });
  };

  const allowedCats: AccountingCategory[] =
    filters.kind === "expense"
      ? (EXPENSE_CATEGORIES as AccountingCategory[])
      : filters.kind === "income"
        ? (INCOME_CATEGORIES as AccountingCategory[])
        : [
            ...(EXPENSE_CATEGORIES as AccountingCategory[]),
            ...(INCOME_CATEGORIES as AccountingCategory[]),
          ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div
        className="flex flex-1 min-w-[220px] items-center gap-2 rounded-md px-3 py-2"
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
          placeholder="Rechercher dans les notes…"
          className="flex-1 bg-transparent text-[12.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>

      {/* Kind tabs */}
      <KindTabs value={filters.kind} onChange={setKind} />

      {/* Category dropdown */}
      <div
        className="rounded-md"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <select
          value={filters.category}
          onChange={(e) =>
            onChangeFilters({
              ...filters,
              category: e.target.value as AccountingCategory | "all",
            })
          }
          className="bg-transparent px-3 py-2 text-[12px] text-zinc-200 focus:outline-none"
          style={{ colorScheme: "dark" }}
        >
          <option value="all" style={{ background: "#18181B" }}>
            Toutes catégories
          </option>
          {filters.kind === "all" && (
            <option disabled style={{ background: "#18181B" }}>
              ── Dépenses ──
            </option>
          )}
          {allowedCats
            .filter((c) => ACCOUNTING_CATEGORIES_META[c].kind === "expense")
            .map((c) => (
              <option key={c} value={c} style={{ background: "#18181B" }}>
                {ACCOUNTING_CATEGORIES_META[c].label}
              </option>
            ))}
          {filters.kind === "all" && (
            <option disabled style={{ background: "#18181B" }}>
              ── Gains ──
            </option>
          )}
          {allowedCats
            .filter((c) => ACCOUNTING_CATEGORIES_META[c].kind === "income")
            .map((c) => (
              <option key={c} value={c} style={{ background: "#18181B" }}>
                {ACCOUNTING_CATEGORIES_META[c].label}
              </option>
            ))}
        </select>
      </div>

      {/* Sort */}
      <div
        className="rounded-md"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <select
          value={filters.sort}
          onChange={(e) =>
            onChangeFilters({
              ...filters,
              sort: e.target.value as AccountingFilters["sort"],
            })
          }
          className="bg-transparent px-3 py-2 text-[12px] text-zinc-200 focus:outline-none"
          style={{ colorScheme: "dark" }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key} style={{ background: "#18181B" }}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle FLAT / MENSUEL */}
      <div
        className="flex items-center gap-0.5 rounded-md p-[2px]"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {(["flat", "monthly"] as AccountingViewMode[]).map((m) => {
          const active = m === viewMode;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChangeViewMode(m)}
              className="ease-expo rounded-[4px] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] transition-colors"
              style={{
                background: active ? "#27272A" : "transparent",
                color: active ? "#FAFAFA" : "#71717A",
              }}
            >
              {m === "flat" ? "FLAT" : "MENSUEL"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KindTabs({
  value,
  onChange,
}: {
  value: "all" | AccountingKind;
  onChange: (k: "all" | AccountingKind) => void;
}) {
  const opts: Array<{ key: "all" | AccountingKind; label: string; color?: string }> = [
    { key: "all", label: "TOUS" },
    { key: "expense", label: "DÉPENSE", color: KIND_COLOR.expense },
    { key: "income", label: "GAIN", color: KIND_COLOR.income },
  ];
  return (
    <div
      className="flex items-center gap-0.5 rounded-md p-[2px]"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {opts.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className="ease-expo rounded-[4px] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] transition-colors"
            style={{
              background: active ? "#27272A" : "transparent",
              color: active
                ? opt.color ?? "#FAFAFA"
                : "#71717A",
              boxShadow:
                active && opt.color ? `inset 0 0 0 1px ${opt.color}` : undefined,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}