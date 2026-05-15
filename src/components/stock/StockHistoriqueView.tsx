import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, RefreshCw } from "lucide-react";
import {
  type StockItem,
  type StockDensity,
  type StockHistoriqueFilters,
  DEFAULT_STOCK_HISTORIQUE_FILTERS,
  STOCK_HISTORIQUE_SORT_OPTIONS,
  STOCK_DENSITIES,
  applyHistoriqueFilters,
  computeHistoriqueKpis,
  formatDateShortFR,
  formatEur,
  getMargeNette,
  getMargeNettePct,
  getDureeVente,
  PLATFORM_LABELS,
  PLATFORM_DOT_COLOR,
  type StockCategoryFilter,
} from "./datasets";
import { HARDWARE_CATEGORIES, type HardwareCategory } from "@/components/catalog/datasets";
import ModelImage from "@/components/catalog/ModelImage";
import StockKebabMenu, { type KebabAction } from "./StockKebabMenu";

type Props = {
  items: StockItem[];
  density: StockDensity;
  onChangeDensity: (d: StockDensity) => void;
  onRowClick?: (item: StockItem) => void;
  onEditSale: (item: StockItem) => void;
  onCancelSale: (item: StockItem) => void;
  onReSell: (item: StockItem) => void;
  onDelete: (id: string) => void;
};

const CATEGORY_OPTIONS: Array<{ key: StockCategoryFilter; label: string }> = [
  { key: "ALL", label: "TOUS" },
  ...HARDWARE_CATEGORIES.map((c) => ({ key: c as StockCategoryFilter, label: c })),
  { key: "OTHER", label: "OTHER" },
];

export default function StockHistoriqueView({
  items,
  density,
  onChangeDensity,
  onRowClick,
  onEditSale,
  onCancelSale,
  onReSell,
  onDelete,
}: Props) {
  const [filters, setFilters] = useState<StockHistoriqueFilters>(
    DEFAULT_STOCK_HISTORIQUE_FILTERS,
  );

  const kpis = useMemo(() => computeHistoriqueKpis(items), [items]);
  const visible = useMemo(() => applyHistoriqueFilters(items, filters), [items, filters]);

  const margeColor = (v: number | null) =>
    v == null ? "#71717A" : v > 0 ? "#10B981" : v < 0 ? "#EF4444" : "#71717A";

  const buildActions = (item: StockItem): KebabAction[] => {
    const isSold = item.status === "sold";
    return [
      {
        key: "edit",
        label: isSold ? "Modifier la vente" : "Modifier",
        icon: Pencil,
        onClick: () => onEditSale(item),
      },
      isSold
        ? {
            key: "cancel",
            label: "Annuler la vente",
            icon: RefreshCw,
            onClick: () => onCancelSale(item),
          }
        : {
            key: "resell",
            label: "Re-marquer comme vendu",
            icon: RefreshCw,
            onClick: () => onReSell(item),
          },
      {
        key: "delete",
        label: "Supprimer",
        icon: Trash2,
        destructive: true,
        separatorBefore: true,
        onClick: () => onDelete(item.id),
      },
    ];
  };

  const rowPadY = density === "compact" ? "py-2.5" : "py-3.5";

  return (
    <div className="flex flex-col gap-6">
      {/* KPI tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="CA CUMULÉ"
          value={`${formatEur(kpis.caEur)} €`}
          subtitle={`${kpis.countSold} vente${kpis.countSold > 1 ? "s" : ""} · hors retours`}
        />
        <Tile
          label="MARGE NETTE CUMULÉE"
          value={`${kpis.margeCumuleeEur >= 0 ? "+" : ""}${formatEur(kpis.margeCumuleeEur)} €`}
          subtitle="après frais plateforme"
          accent
          valueColor="#10B981"
        />
        <Tile
          label="MARGE MOYENNE"
          value={`${kpis.margePondereeMoyennePct >= 0 ? "+" : ""}${kpis.margePondereeMoyennePct.toFixed(1)}%`}
          subtitle="pondérée par CA"
        />
        <Tile
          label="DURÉE MOY. VENTE"
          value={`${kpis.dureeMedianeJ} j`}
          subtitle="médiane achat → vente"
        />
      </div>

      {/* Filter bar */}
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
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Rechercher un modèle vendu…"
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
                  onClick={() => setFilters({ ...filters, category: opt.key })}
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
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters({ ...filters, sort: e.target.value as typeof filters.sort })
            }
            className="ease-expo rounded-md px-3 py-2 font-mono text-[11px] tracking-[0.06em] text-zinc-300 transition-colors hover:text-zinc-100 focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.02)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {STOCK_HISTORIQUE_SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key} style={{ background: "#18181B" }}>
                {opt.label}
              </option>
            ))}
          </select>
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

      {/* Table */}
      {visible.length === 0 ? (
        <div className="mk-card-flat-soft px-6 py-12 text-center text-[13px] text-zinc-500">
          Aucune vente enregistrée pour le moment.
        </div>
      ) : (
        <div className="mk-card-flat-soft">
          <div
            className="grid grid-cols-12 gap-3 px-4 py-2.5"
            style={{
              background: "rgba(255,255,255,0.015)",
              boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <Header className="col-span-4">MODÈLE</Header>
            <Header className="col-span-1">DATE VENTE</Header>
            <Header className="col-span-3">ACHAT → VENTE</Header>
            <Header className="col-span-2 text-right">MARGE NETTE</Header>
            <Header className="col-span-1">DURÉE</Header>
            <Header className="col-span-1">PF.</Header>
          </div>
          {visible.map((item) => {
            const isReturned = item.status === "returned";
            const nette = getMargeNette(item);
            const pct = getMargeNettePct(item);
            const duree = getDureeVente(item);
            const isHwCat = item.category_snapshot !== "OTHER";
            const platform = item.sale_platform ?? item.purchase_platform;
            return (
              <div
                key={item.id}
                className={`group relative grid cursor-pointer grid-cols-12 items-center gap-3 px-4 ${rowPadY} ease-expo transition-colors hover:bg-white/[0.02]`}
                style={{
                  background: isReturned ? "rgba(113,113,122,0.04)" : undefined,
                  boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
                }}
                onClick={() => onRowClick?.(item)}
              >
                <div className="col-span-4 flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                    }}
                  >
                    {isHwCat ? (
                      <ModelImage
                        category={item.category_snapshot as HardwareCategory}
                        url={null}
                        className={isReturned ? "opacity-40" : "opacity-70"}
                      />
                    ) : (
                      <span className="font-mono text-[9px] text-zinc-600">—</span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div
                      className="truncate text-[13px]"
                      style={{ color: isReturned ? "#71717A" : "#E4E4E7" }}
                    >
                      {item.model_name_snapshot}
                    </div>
                    <span
                      className="mt-0.5 inline-flex w-fit items-center rounded px-1 py-0.5 font-mono text-[9px] tracking-[0.14em]"
                      style={{
                        background: isReturned
                          ? "rgba(113,113,122,0.18)"
                          : "rgba(16,185,129,0.12)",
                        color: isReturned ? "#A1A1AA" : "#10B981",
                      }}
                    >
                      {isReturned ? "RETOURNÉ" : "VENDU"}
                    </span>
                  </div>
                </div>
                <div className="col-span-1 font-mono text-[11px] text-zinc-500">
                  {item.sale_date ? formatDateShortFR(item.sale_date) : "—"}
                </div>
                <div className="col-span-3 font-mono text-[12px] tabular-nums">
                  <span className="text-zinc-500">
                    {formatEur(item.purchase_price_eur)} €
                  </span>
                  <span className="px-1.5 text-zinc-700">→</span>
                  <span style={{ color: isReturned ? "#52525B" : "#E4E4E7" }}>
                    {item.sale_price_eur != null
                      ? `${formatEur(item.sale_price_eur)} €`
                      : "— €"}
                  </span>
                </div>
                <div className="col-span-2 flex flex-col items-end">
                  <span
                    className="tabular-nums text-[12.5px]"
                    style={{ color: margeColor(nette), fontWeight: 500 }}
                  >
                    {nette != null
                      ? `${nette >= 0 ? "+" : ""}${formatEur(nette)} €`
                      : "—"}
                  </span>
                  {pct != null && (
                    <span
                      className="font-mono text-[10px] tabular-nums"
                      style={{ color: margeColor(nette) }}
                    >
                      {pct >= 0 ? "+" : ""}
                      {pct.toFixed(1)}%
                    </span>
                  )}
                  {isReturned && nette != null && (
                    <span className="font-mono text-[9.5px] text-zinc-600">
                      frais
                    </span>
                  )}
                </div>
                <div className="col-span-1 font-mono text-[11px] tabular-nums text-zinc-400">
                  {duree != null ? `${duree} j` : "—"}
                </div>
                <div className="col-span-1 flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: PLATFORM_DOT_COLOR[platform] }}
                    />
                    {PLATFORM_LABELS[platform]}
                  </span>
                  <div
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StockKebabMenu actions={buildActions(item)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Header({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`font-mono text-[10px] tracking-[0.16em] text-zinc-600 ${className}`}
    >
      {children}
    </div>
  );
}

function Tile({
  label,
  value,
  subtitle,
  accent = false,
  valueColor = "#FAFAFA",
}: {
  label: string;
  value: string;
  subtitle: string;
  accent?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: accent ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
        boxShadow: accent
          ? "inset 0 0 0 1px rgba(16,185,129,0.22)"
          : "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div className="font-mono text-[10.5px] tracking-[0.18em] text-zinc-600">
        {label}
      </div>
      <div
        className="mt-3 font-mono text-[22px] font-medium tabular-nums"
        style={{ color: valueColor }}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10.5px] text-zinc-500">{subtitle}</div>
    </div>
  );
}