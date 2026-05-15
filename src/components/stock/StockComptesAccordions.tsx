import { ChevronUp, ChevronDown } from "lucide-react";
import {
  computeAccountingKpis,
  computeRatioDepensesCa,
  currentYearMonth,
  formatYearMonthFR,
  groupByYearMonth,
  type AccountingEntry,
} from "./accountingDatasets";
import StockComptesTableFlat from "./StockComptesTableFlat";

type Props = {
  entries: AccountingEntry[];
  // monthly CA mapping for ratio: yearMonth -> caEur
  monthlyCa: Map<string, number>;
  expandedMonths: string[];
  onToggleMonth: (yearMonth: string) => void;
  onEdit: (entry: AccountingEntry) => void;
  onDelete: (id: string) => void;
};

const NBSP = "\u00A0";

function fmt(v: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

export default function StockComptesAccordions({
  entries,
  monthlyCa,
  expandedMonths,
  onToggleMonth,
  onEdit,
  onDelete,
}: Props) {
  const grouped = groupByYearMonth(entries);
  const cur = currentYearMonth();

  if (grouped.size === 0) {
    return (
      <div className="mk-card-flat-soft px-6 py-12 text-center text-[13px] text-zinc-500">
        Aucune entrée ne correspond aux filtres actifs.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {Array.from(grouped.entries()).map(([ym, monthEntries]) => {
        const isExpanded = expandedMonths.includes(ym);
        const kpi = computeAccountingKpis(monthEntries);
        const caMonth = monthlyCa.get(ym) ?? 0;
        const ratio = computeRatioDepensesCa(kpi.expensesTotalEur, caMonth);
        const isCurrent = ym === cur;
        return (
          <div
            key={ym}
            className="overflow-hidden rounded-lg"
            style={{
              background: "rgba(255,255,255,0.02)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <button
              type="button"
              onClick={() => onToggleMonth(ym)}
              className="ease-expo flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-medium text-zinc-100">
                  {formatYearMonthFR(ym)}
                </span>
                {isCurrent && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      color: "#71717A",
                    }}
                  >
                    EN COURS
                  </span>
                )}
              </div>
              <div className="flex items-center gap-5">
                <MiniKpi
                  label="DÉPENSES"
                  value={`−${fmt(kpi.expensesTotalEur)}${NBSP}€`}
                  color="#EF4444"
                />
                <MiniKpi
                  label="GAINS"
                  value={`+${fmt(kpi.incomesTotalEur)}${NBSP}€`}
                  color="#10B981"
                />
                <MiniKpi
                  label="SOLDE"
                  value={
                    kpi.netBalanceEur === 0
                      ? `0${NBSP}€`
                      : `${kpi.netBalanceEur > 0 ? "+" : "−"}${fmt(Math.abs(kpi.netBalanceEur))}${NBSP}€`
                  }
                  color={kpi.netBalanceEur >= 0 ? "#10B981" : "#EF4444"}
                />
                <MiniKpi
                  label="RATIO DÉP./CA"
                  value={ratio == null ? "—" : `${ratio.toFixed(1)}${NBSP}%`}
                  color="#D4D4D8"
                />
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                )}
              </div>
            </button>
            {isExpanded && (
              <div
                className="px-3 pb-3 pt-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
              >
                <StockComptesTableFlat
                  entries={monthEntries}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniKpi({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-mono text-[9px] tracking-[0.16em] text-zinc-600">
        {label}
      </span>
      <span
        className="font-mono text-[12px] tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}