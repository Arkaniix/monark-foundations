import { useNavigate } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { formatEurInt, formatEurSignedInt } from "@/components/stock/bilanCalculations";
import type { StockRow } from "@/components/dashboard/dashboardModel";

type StockTableProps = { rows: StockRow[]; capital: number; potential: number };

export function StockTable({ rows, capital, potential }: StockTableProps) {
  const navigate = useNavigate();
  return (
    <div className="mk-card-flat-soft p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Package size={16} className="text-zinc-500" />
          <span className="text-[13px] font-medium text-zinc-200">Stock à écouler</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-mono text-[9px] text-zinc-600">CAPITAL</div>
            <div className="font-mono text-[12px] tabular-nums text-zinc-300">{formatEurInt(capital)}&nbsp;€</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] text-zinc-600">PROFIT POT.</div>
            <div className="font-mono text-[12px] tabular-nums" style={{ color: "#10B981" }}>{formatEurInt(potential)}&nbsp;€</div>
          </div>
          <button onClick={() => navigate({ to: "/stock" })} className="arrow-link font-mono text-[10px] text-zinc-500 hover:text-zinc-200">
            gérer <span className="arr">→</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-2 px-3 pb-2 font-mono text-[9px] tracking-wider text-zinc-600">
        <div className="col-span-5">PIÈCE</div>
        <div className="col-span-2 text-right">ACHAT</div>
        <div className="col-span-2 text-right">NET EST.</div>
        <div className="col-span-2 text-right">PROFIT</div>
        <div className="col-span-1 text-right">ÂGE</div>
      </div>
      {rows.length === 0 ? (
        <div className="px-3 py-6 text-center font-mono text-[11px] text-zinc-600">Aucune pièce active en stock.</div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((s) => (
            <div key={s.id} className="mk-subcard-soft row-hover grid grid-cols-12 items-center gap-2 px-3 py-2.5">
              <div className="col-span-5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.isDormant ? "live-dot" : ""}`} style={{ background: s.statusColor, color: s.statusColor }} />
                  <span className="truncate text-[12px] font-medium text-zinc-100">{s.name}</span>
                </div>
                <div className="mt-0.5 pl-3.5 font-mono text-[9.5px] text-zinc-500">{s.statusLabel} · {s.platformLabel}</div>
              </div>
              <div className="col-span-2 text-right font-mono text-[12px] tabular-nums text-zinc-400">{formatEurInt(s.paid)}&nbsp;€</div>
              <div className="col-span-2 text-right font-mono text-[12px] tabular-nums text-zinc-200">{s.netEst == null ? "—" : <>{formatEurInt(s.netEst)}&nbsp;€</>}</div>
              <div className="col-span-2 text-right font-mono text-[12px] tabular-nums" style={{ color: s.profit == null ? "#52525b" : s.profit >= 0 ? "#10B981" : "#EF4444" }}>{s.profit == null ? "—" : formatEurSignedInt(s.profit)}</div>
              <div className="col-span-1 text-right font-mono text-[11px] tabular-nums" style={{ color: s.ageColor }}>{s.ageDays}j</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}