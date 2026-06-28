import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Counter } from "@/components/ui";
import { formatEurInt } from "@/components/stock/bilanCalculations";
import { Segmented } from "@/components/dashboard/Segmented";
import type { WeeklyWindow, WeeklyBucket } from "@/components/dashboard/dashboardModel";

const WINDOW_LABEL: Record<WeeklyWindow, string> = {
  w4: "4 dernières semaines",
  w8: "8 dernières semaines",
  wq: "13 dernières semaines",
};

type PerfChartProps = { weekly: Record<WeeklyWindow, WeeklyBucket[]>; empty?: boolean };

export function PerfChart({ weekly, empty = false }: PerfChartProps) {
  const [win, setWin] = useState<WeeklyWindow>("w8");
  const [shown, setShown] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const series = weekly[win];
  const max = Math.max(1, ...series.map((w) => w.profit));
  const total = series.reduce((s, w) => s + w.profit, 0);
  const totalCount = series.reduce((s, w) => s + w.count, 0);
  const active = hover != null ? series[hover] : null;

  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, [win]);

  return (
    <div className="mk-card-flat-soft p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <BarChart3 size={16} className="text-zinc-500" />
            <span className="text-[13px] font-medium text-zinc-200">Profit net réalisé</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-500">{empty ? "En attente de ta première vente" : WINDOW_LABEL[win]}</div>
        </div>
        {!empty && <div className="flex items-center gap-4">
          <Segmented<WeeklyWindow>
            options={[{ key: "w4", label: "4 sem." }, { key: "w8", label: "8 sem." }, { key: "wq", label: "Trim." }]}
            value={win}
            onChange={setWin}
          />
          <div className="text-right">
            <div className="font-mono text-[10px] text-zinc-500">{active ? active.label : "TOTAL"}</div>
            <div className="font-mono text-[20px] font-semibold tabular-nums" style={{ color: "#10B981" }}>
              {active ? `${formatEurInt(active.profit)} €` : <Counter key={win} value={total} suffix=" €" duration={420} />}
            </div>
            <div className="font-mono text-[10px] text-zinc-600">{active ? `${active.count} ventes` : `${totalCount} ventes`}</div>
          </div>
        </div>}
      </div>
      {empty ? (
        <div className="relative h-44">
          <div className="absolute left-0 right-0 bottom-[18px] h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="ghost-sweep absolute inset-0 flex items-end gap-2.5 rounded-lg overflow-hidden">
            {[40, 62, 30, 70, 48, 80, 55, 66].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md" style={{
                height: h + "%",
                marginBottom: 18,
                background: "rgba(255,255,255,0.035)",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderBottom: "none",
              }} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-[12.5px] text-zinc-400 text-center px-6 py-2 rounded-lg" style={{ background: "rgba(9,9,11,0.55)", backdropFilter: "blur(2px)" }}>
              Tes profits réalisés apparaîtront après ta première vente.
            </div>
          </div>
        </div>
      ) : (
      <div className="relative flex h-44 items-end gap-2.5">
        <div className="absolute bottom-[18px] left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
        {series.map((w, i) => {
          const h = (w.profit / max) * 100;
          const isActive = hover === i;
          const isLast = i === series.length - 1;
          return (
            <div key={i} className="relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-2"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <div className="font-mono text-[9.5px] tabular-nums" style={{ color: isActive ? "#10B981" : "#52525b", opacity: isActive ? 1 : 0, height: 12, transition: "opacity 160ms" }}>
                {formatEurInt(w.profit)}
              </div>
              <div className={`w-full rounded-t-md ${isLast && hover == null ? "bar-glow" : ""}`}
                style={{
                  height: `${shown ? h : 0}%`,
                  minHeight: 4,
                  background: isActive ? "#10B981" : isLast ? "rgba(16,185,129,0.55)" : "rgba(255,255,255,0.10)",
                  transition: `height 760ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms, background 180ms ease`,
                }} />
              <div className="whitespace-nowrap font-mono text-[9px]" style={{ color: isActive || isLast ? "#a1a1aa" : "#52525b" }}>{w.label}</div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}