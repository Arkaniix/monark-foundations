import { Search, LayoutGrid, List, RotateCcw, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  SORT_OPTIONS,
  type CatalogFilters,
  type CatalogSortKey,
  type Manufacturer,
} from "./datasets";

type Props = {
  filters: CatalogFilters;
  sort: CatalogSortKey;
  view: "grid" | "list";
  facets: {
    manufacturers: string[];
    brands: string[];
    families: string[];
  };
  onChangeFilters: (next: CatalogFilters) => void;
  onChangeSort: (next: CatalogSortKey) => void;
  onChangeView: (next: "grid" | "list") => void;
  onReset: () => void;
};

/**
 * Filter bar P1.1 : pas de dropdown CAT (les onglets prennent le relais).
 * Row 1 : recherche + view toggle + reset
 * Row 2 : Fabricant + Marque + Famille  (ml-auto) Tri
 */
export default function CatalogFilterBar({
  filters,
  sort,
  view,
  facets,
  onChangeFilters,
  onChangeSort,
  onChangeView,
  onReset,
}: Props) {
  const updateField = <K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K],
  ) => {
    onChangeFilters({ ...filters, [key]: value });
  };

  return (
    <div className="mk-card-flat-soft flex flex-col gap-3 p-3">
      {/* Row 1 */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2">
          <Search className="h-3.5 w-3.5 text-zinc-600" strokeWidth={1.5} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateField("search", e.target.value)}
            placeholder="Rechercher un modèle, fabricant, alias…"
            className="w-full bg-transparent font-mono text-[11.5px] text-zinc-200 outline-none placeholder:text-zinc-600"
          />
        </div>

        <div className="flex items-center rounded-md border border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => onChangeView("grid")}
            className={`px-2.5 py-2 transition-colors ${
              view === "grid" ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
            }`}
            aria-label="Vue grille"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => onChangeView("list")}
            className={`px-2.5 py-2 transition-colors ${
              view === "list" ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
            }`}
            aria-label="Vue liste"
            aria-pressed={view === "list"}
          >
            <List className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="ease-expo flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-[10.5px] tracking-[0.16em] text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
        >
          <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
          RESET
        </button>
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          label="FABRICANT"
          value={filters.manufacturer}
          options={[
            { value: "ALL", label: "Tous" },
            ...facets.manufacturers.map((m) => ({ value: m, label: m })),
          ]}
          onChange={(v) => updateField("manufacturer", v as Manufacturer | "ALL")}
          dimWhenAll
        />
        <FilterPill
          label="MARQUE"
          value={filters.brand}
          options={[
            { value: "ALL", label: "Toutes" },
            ...facets.brands.map((b) => ({ value: b, label: b })),
          ]}
          onChange={(v) => updateField("brand", v)}
          dimWhenAll
          disabled={facets.brands.length === 0}
        />
        <FilterPill
          label="FAMILLE"
          value={filters.family}
          options={[
            { value: "ALL", label: "Toutes" },
            ...facets.families.map((f) => ({ value: f, label: f })),
          ]}
          onChange={(v) => updateField("family", v)}
          dimWhenAll
        />
        <div className="ml-auto">
          <FilterPill
            label="TRI"
            value={sort}
            options={SORT_OPTIONS.map((o) => ({ value: o.key, label: o.label }))}
            onChange={(v) => onChangeSort(v as CatalogSortKey)}
          />
        </div>
      </div>
    </div>
  );
}

type FilterPillProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  dimWhenAll?: boolean;
  disabled?: boolean;
};

function FilterPill({
  label,
  value,
  options,
  onChange,
  dimWhenAll = false,
  disabled = false,
}: FilterPillProps) {
  const display = options.find((o) => o.value === value)?.label ?? value;
  const isDim = dimWhenAll && value === "ALL";
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: 320 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const available = window.innerHeight - rect.bottom - 16;
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
        maxH: Math.max(160, Math.min(320, available)),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !panelRef.current?.contains(t)) {
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
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`relative inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10.5px] tracking-[0.14em] transition-colors ${
          disabled ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.04]"
        }`}
      >
        <span className="text-zinc-600">{label}</span>
        <span className={isDim ? "text-zinc-500" : "text-zinc-200"}>{display}</span>
        <ChevronDown
          className={`h-3 w-3 text-zinc-600 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            className="fixed z-[110] overflow-y-auto rounded-md py-1"
            style={{
              top: pos.top,
              left: pos.left,
              minWidth: pos.width,
              maxHeight: pos.maxH,
              background: "#18181B",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.08) transparent",
            }}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="ease-expo flex w-full items-center px-3 py-2 text-left font-mono text-[11px] tracking-[0.06em] transition-colors"
                  style={{
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    color: active ? "#FAFAFA" : "#E4E4E7",
                    borderLeft: active ? "2px solid #3B82F6" : "2px solid transparent",
                    paddingLeft: active ? 10 : 12,
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}