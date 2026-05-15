import { useEffect, useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import {
  applyAccountingFilters,
  computeAccountingKpis,
  currentYearMonth,
  loadAccountingViewMode,
  loadExpandedMonths,
  saveAccountingViewMode,
  saveExpandedMonths,
  toYearMonth,
  DEFAULT_ACCOUNTING_FILTERS,
  type AccountingEntry,
  type AccountingFilters,
  type AccountingViewMode,
} from "./accountingDatasets";
import StockKpiComptes from "./StockKpiComptes";
import StockComptesFilterBar from "./StockComptesFilterBar";
import StockComptesTableFlat from "./StockComptesTableFlat";
import StockComptesAccordions from "./StockComptesAccordions";
import { computeHistoriqueKpis, type StockItem } from "./datasets";

type Props = {
  entries: AccountingEntry[];
  stockItems: StockItem[];
  onOpenAdd: () => void;
  onEdit: (entry: AccountingEntry) => void;
  onDelete: (id: string) => void;
};

export default function StockComptesView({
  entries,
  stockItems,
  onOpenAdd,
  onEdit,
  onDelete,
}: Props) {
  const [filters, setFilters] = useState<AccountingFilters>(
    DEFAULT_ACCOUNTING_FILTERS,
  );
  const [viewMode, setViewMode] = useState<AccountingViewMode>(() =>
    loadAccountingViewMode(),
  );
  const [expandedMonths, setExpandedMonths] = useState<string[]>(() =>
    loadExpandedMonths([currentYearMonth()]),
  );

  useEffect(() => {
    saveAccountingViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    saveExpandedMonths(expandedMonths);
  }, [expandedMonths]);

  const histoKpis = useMemo(
    () => computeHistoriqueKpis(stockItems),
    [stockItems],
  );

  const kpi = useMemo(() => computeAccountingKpis(entries), [entries]);

  const filtered = useMemo(
    () => applyAccountingFilters(entries, filters),
    [entries, filters],
  );

  // CA mensuel (pour le ratio par mois en vue mensuelle)
  const monthlyCa = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of stockItems) {
      if (it.status === "sold" && it.sale_date && it.sale_price_eur != null) {
        const ym = toYearMonth(it.sale_date);
        map.set(ym, (map.get(ym) ?? 0) + it.sale_price_eur);
      }
    }
    return map;
  }, [stockItems]);

  const handleToggleMonth = (ym: string) => {
    setExpandedMonths((prev) =>
      prev.includes(ym) ? prev.filter((x) => x !== ym) : [...prev, ym],
    );
  };

  if (entries.length === 0) {
    return (
      <div className="mk-card-flat-soft flex flex-col items-center gap-5 px-6 py-20 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.03)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <Receipt className="h-5 w-5 text-zinc-500" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[15px] font-medium text-zinc-100">
            Aucune entrée comptable enregistrée
          </div>
          <div className="max-w-md text-[13px] leading-relaxed text-zinc-400">
            Enregistrez vos frais de port, abonnements, électricité, et tout
            ce qui impacte votre marge réelle.
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAdd}
          className="ease-expo flex items-center gap-2 rounded-md px-4 py-2.5 transition-colors"
          style={{
            background: "rgba(59,130,246,0.14)",
            boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.3)",
          }}
        >
          <span
            className="font-mono text-[12px] tracking-wider"
            style={{ color: "#3B82F6" }}
          >
            + AJOUTER UNE ENTRÉE
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StockKpiComptes
        kpi={kpi}
        caEur={histoKpis.caEur}
        margeVentesEur={histoKpis.margeCumuleeEur}
      />
      <StockComptesFilterBar
        filters={filters}
        viewMode={viewMode}
        onChangeFilters={setFilters}
        onChangeViewMode={setViewMode}
      />
      {viewMode === "flat" ? (
        filtered.length === 0 ? (
          <div className="mk-card-flat-soft px-6 py-12 text-center text-[13px] text-zinc-500">
            Aucune entrée ne correspond aux filtres actifs.
          </div>
        ) : (
          <StockComptesTableFlat
            entries={filtered}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      ) : (
        <StockComptesAccordions
          entries={filtered}
          monthlyCa={monthlyCa}
          expandedMonths={expandedMonths}
          onToggleMonth={handleToggleMonth}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}