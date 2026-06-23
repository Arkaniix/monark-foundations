import { Counter } from "@/components/ui";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  sub: string;
  accent: string;
  delta?: number | null;
  idx?: number;
};

export function KpiCard({ icon: Icon, label, value, suffix = "", sub, accent, delta = null, idx = 0 }: KpiCardProps) {
  return (
    <div className="kpi-card sec-in mk-card-flat-soft card-hover relative p-5" style={{ animationDelay: `${idx * 80}ms` }}>
      <div className="mb-4 flex items-start justify-between">
        <div className="relative h-9 w-9">
          <span className="kpi-ring" style={{ color: accent }} />
          <div className="kpi-icon relative flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${accent}16` }}>
            <Icon style={{ color: accent, width: 18, height: 18 }} />
          </div>
        </div>
        {delta != null && (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums"
            style={{ color: delta >= 0 ? "#10B981" : "#EF4444", background: `${delta >= 0 ? "#10B981" : "#EF4444"}14` }}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {`${delta >= 0 ? "+" : ""}${Math.round(delta)}%`}
          </span>
        )}
      </div>
      <div className="mb-1.5 font-mono text-[9.5px] tracking-wider text-zinc-500">{label}</div>
      <div className="font-mono text-[27px] font-semibold leading-none" style={{ color: accent }}>
        <Counter value={value} suffix={suffix} duration={1100} />
      </div>
      <div className="mt-1.5 font-mono text-[10.5px] text-zinc-500">{sub}</div>
    </div>
  );
}