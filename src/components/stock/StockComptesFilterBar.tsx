import { Search } from "lucide-react";
import DropdownSelect, { type DropdownItem } from "./DropdownSelect";
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
    let category = filters.category;
    if (k !== "all" && category !== "all") {
      const meta = ACCOUNTING_CATEGORIES_META[category as AccountingCategory];
      if (meta.kind !== k) category = "all";
    }
    onChangeFilters({ ...filters, kind: k, category });
  };

  // Build category items based on active kind filter
  const showExpenses = filters.kind === "all" || filters.kind === "expense";
  const showIncomes = filters.kind === "all" || filters.kind === "income";

  const categoryItems: DropdownItem<AccountingCategory | "all">[] = [
    { type: "option", value: "all", label: "Toutes catégories" },
  ];
  if (showExpenses) {
    categoryItems.push({ type: "section", label: "DÉPENSES" });
    for (const c of EXPENSE_CATEGORIES) {
      categoryItems.push({
        type: "option",
        value: c,
        label: ACCOUNTING_CATEGORIES_META[c].label,
      });
    }
  }
  if (showIncomes) {
    categoryItems.push({ type: "section", label: "GAINS" });
    for (const c of INCOME_CATEGORIES) {
      categoryItems.push({
        type: "option",
        value: c,
        label: ACCOUNTING_CATEGORIES_META[c].label,
      });
    }
  }

  const categoryLabel =
    filters.category === "all"
      ? "Toutes catégories"
      : ACCOUNTING_CATEGORIES_META[filters.category as AccountingCategory].label;
  const sortLabel =
    SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? "Date ↓";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
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
          placeholder="Rechercher dans les notes…"
          className="flex-1 bg-transparent text-[12.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>

      {/* Kind tabs */}
      <KindTabs value={filters.kind} onChange={setKind} />

      {/* Category dropdown */}
      <DropdownSelect
        value={filters.category}
        label={categoryLabel}
        items={categoryItems}
        onChange={(v) => onChangeFilters({ ...filters, category: v })}
        minWidth={180}
      />

      {/* Sort dropdown */}
      <DropdownSelect
        value={filters.sort}
        label={sortLabel}
        items={SORT_OPTIONS.map((o) => ({
          type: "option" as const,
          value: o.key,
          label: o.label,
        }))}
        onChange={(v) => onChangeFilters({ ...filters, sort: v })}
        minWidth={110}
      />

      {/* Toggle FLAT / MENSUEL */}
      <div
        className="flex h-[30px] items-center gap-0.5 rounded-md p-[2px]"
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
              className="ease-expo rounded-[4px] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors"
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
      className="flex h-[30px] items-center gap-0.5 rounded-md p-[2px]"
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
            className="ease-expo rounded-[4px] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors"
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

// ============ DropdownSelect ============

type DropdownItem<V extends string> =
  | { type: "option"; value: V; label: string }
  | { type: "section"; label: string };

type DropdownSelectProps<V extends string> = {
  value: V;
  label: string;
  items: DropdownItem<V>[];
  onChange: (v: V) => void;
  minWidth?: number;
};

function DropdownSelect<V extends string>({
  value,
  label,
  items,
  onChange,
  minWidth = 140,
}: DropdownSelectProps<V>) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, minWidth),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, minWidth]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !btnRef.current?.contains(t) &&
        !panelRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ease-expo flex h-[30px] items-center justify-between gap-2 rounded-md px-3 font-mono text-[11px] tracking-[0.06em] text-zinc-300 transition-colors hover:text-zinc-100 focus:outline-none"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          minWidth,
        }}
      >
        <span className="truncate">{label}</span>
        <span
          className="font-mono text-[12px] leading-none text-zinc-500"
          aria-hidden
        >
          ⌄
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[110] overflow-hidden rounded-md py-1"
            style={{
              top: pos.top,
              left: pos.left,
              minWidth: pos.width,
              background: "#18181B",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            {items.map((it, idx) => {
              if (it.type === "section") {
                const isFirst = idx === 0;
                return (
                  <div
                    key={`sec-${idx}`}
                    className="px-3 pb-1 pt-2 font-mono text-[9px] tracking-[0.15em] text-zinc-600"
                    style={{
                      borderTop: isFirst
                        ? undefined
                        : "1px solid rgba(255,255,255,0.06)",
                      marginTop: isFirst ? 0 : 4,
                    }}
                  >
                    {it.label}
                  </div>
                );
              }
              const active = it.value === value;
              return (
                <button
                  key={`opt-${it.value}`}
                  type="button"
                  onClick={() => {
                    onChange(it.value);
                    setOpen(false);
                  }}
                  className="ease-expo flex w-full items-center px-3 py-2 text-left font-mono text-[12px] transition-colors"
                  style={{
                    background: active
                      ? "rgba(255,255,255,0.06)"
                      : "transparent",
                    color: active ? "#FAFAFA" : "#E4E4E7",
                    borderLeft: active
                      ? "2px solid #3B82F6"
                      : "2px solid transparent",
                    paddingLeft: active ? 10 : 12,
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {it.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
