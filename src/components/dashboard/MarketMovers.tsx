import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { formatEurInt } from "@/components/stock/bilanCalculations";
import type { MoverRow } from "@/components/dashboard/dashboardModel";

type MarketMoversProps = { movers: MoverRow[] };

export function MarketMovers({ movers }: MarketMoversProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 150);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="mk-card-flat-soft h-full p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <Sparkles size={16} className="text-zinc-500" />
        <span className="text-[13px] font-medium text-zinc-200">Tendances marché</span>
        <span className="ml-auto font-mono text-[9px] text-zinc-600">30 j</span>
      </div>
      {movers.length === 0 ? (
        <div className="py-6 text-center font-mono text-[11px] text-zinc-600">Pas de mouvement marquant.</div>
      ) : (
        <div className="space-y-2.5">
          {movers.map((m, i) => {
            const up = m.trendPct >= 0;
            const col = up ? "#10B981" : "#EF4444";
            const Icon = up ? TrendingUp : TrendingDown;
            const w = Math.min(100, Math.abs(m.trendPct) * 9);
            return (
              <div key={m.id} className="row-hover -mx-1 flex items-center gap-3 rounded px-1 py-1">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] text-zinc-200">{m.name}</div>
                  <div className="font-mono text-[9.5px] text-zinc-600">{m.category} · {formatEurInt(m.base)}&nbsp;€</div>
                </div>
                <div className="h-1 w-16 shrink-0 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full" style={{ width: `${shown ? w : 0}%`, background: col, marginLeft: up ? 0 : "auto", transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms` }} />
                </div>
                <span className="inline-flex w-12 shrink-0 items-center justify-end gap-0.5 font-mono text-[11px] tabular-nums" style={{ color: col }}>
                  <Icon size={12} />{`${up ? "+" : "−"}${Math.abs(Math.round(m.trendPct))}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}