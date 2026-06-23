import { useEffect, useState } from "react";
import { PieChart } from "lucide-react";
import { Counter } from "@/components/ui";
import { formatEurInt } from "@/components/stock/bilanCalculations";
import { Segmented } from "@/components/dashboard/Segmented";
import type { DonutSegment } from "@/components/dashboard/dashboardModel";

type DonutMode = "cat" | "status";
type CapitalDonutProps = { capital: number; byCategory: DonutSegment[]; byStatus: DonutSegment[] };

const R = 46;
const CIRC = 2 * Math.PI * R;
const GAP = 2;

export function CapitalDonut({ capital, byCategory, byStatus }: CapitalDonutProps) {
  const [mode, setMode] = useState<DonutMode>("cat");
  const [shown, setShown] = useState(false);
  const segments = mode === "cat" ? byCategory : byStatus;

  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setShown(true), 40);
    return () => clearTimeout(t);
  }, [mode]);

  let acc = 0;
  const arcs = segments.map((s) => {
    const len = (s.pct / 100) * CIRC;
    const arc = { seg: s, dash: Math.max(0, len - GAP), offset: -acc };
    acc += len;
    return arc;
  });

  return (
    <div className="mk-card-flat-soft flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PieChart size={16} className="text-zinc-500" />
          <span className="text-[13px] font-medium text-zinc-200">Répartition du capital</span>
        </div>
        <Segmented<DonutMode>
          options={[{ key: "cat", label: "Catégorie" }, { key: "status", label: "Statut" }]}
          value={mode}
          onChange={setMode}
        />
      </div>

      {segments.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6 font-mono text-[11px] text-zinc-600">Aucun capital engagé.</div>
      ) : (
        <div className="flex flex-1 items-center gap-6">
          <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
            <svg viewBox="0 0 120 120" width={132} height={132}>
              <circle cx={60} cy={60} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={12} />
              <g transform="rotate(-90 60 60)" style={{ opacity: shown ? 1 : 0, transition: "opacity 420ms ease" }}>
                {arcs.map((a) => (
                  <circle key={a.seg.key} cx={60} cy={60} r={R} fill="none" stroke={a.seg.color} strokeWidth={12} strokeLinecap="butt"
                    strokeDasharray={`${shown ? a.dash : 0} ${CIRC}`} strokeDashoffset={a.offset}
                    style={{ transition: "stroke-dasharray 720ms cubic-bezier(0.16,1,0.3,1)" }} />
                ))}
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-[18px] font-semibold leading-none tabular-nums text-zinc-100">
                <Counter value={capital} suffix=" €" duration={1100} />
              </div>
              <div className="mt-1 font-mono text-[8.5px] tracking-wider text-zinc-600">CAPITAL</div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2" style={{ opacity: shown ? 1 : 0, transition: "opacity 420ms ease" }}>
            {segments.map((s) => (
              <div key={s.key} className="flex items-center gap-2.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 truncate text-[12px] text-zinc-300">{s.label}</span>
                <span className="font-mono text-[11.5px] tabular-nums text-zinc-200">{formatEurInt(s.value)}&nbsp;€</span>
                <span className="w-9 text-right font-mono text-[10px] tabular-nums text-zinc-500">{Math.round(s.pct)}&nbsp;%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}