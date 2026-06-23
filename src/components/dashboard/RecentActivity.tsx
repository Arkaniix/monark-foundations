import { useNavigate } from "@tanstack/react-router";
import { History, ShoppingCart, Tag } from "lucide-react";
import { formatEurSignedInt } from "@/components/stock/bilanCalculations";
import { VERDICT_COLORS } from "@/components/dashboard/datasets";
import { useEstimatorHistory } from "@/lib/estimatorHistory";
import { Skeleton } from "@/components/ui";

function hhmm(ts: number): string {
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function RecentActivity() {
  const navigate = useNavigate();
  const { entries, loading } = useEstimatorHistory();
  const recent = [...entries].sort((a, b) => b.ts - a.ts).slice(0, 6);
  return (
    <div className="mk-card-flat-soft p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <History size={16} className="text-zinc-500" />
          <span className="text-[13px] font-medium text-zinc-200">Activité récente</span>
        </div>
        <button onClick={() => navigate({ to: "/estimator" })} className="arrow-link font-mono text-[10px] text-zinc-500 hover:text-zinc-200">
          historique <span className="arr">→</span>
        </button>
      </div>
      {loading ? (
        <div className="space-y-1.5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
      ) : recent.length === 0 ? (
        <div className="py-6 text-center font-mono text-[11px] text-zinc-600">Aucune estimation récente.</div>
      ) : (
        <div className="space-y-1.5">
          {recent.map((e, i) => {
            const buy = (e.inputs.flow ?? "buy") === "buy";
            const accent = buy ? "#60A5FA" : "#A78BFA";
            const margin = e.result.net_margin_eur;
            return (
              <button key={e.id} onClick={() => navigate({ to: "/estimator" })}
                className="row-in row-hover mk-subcard-soft flex w-full items-center gap-3 px-3 py-2.5 text-left"
                style={{ animationDelay: `${i * 55}ms` }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: `${accent}16` }}>
                  {buy ? <ShoppingCart size={14} style={{ color: accent }} /> : <Tag size={14} style={{ color: accent }} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-zinc-100">{e.result.model_name}</div>
                  <div className="font-mono text-[9.5px] text-zinc-500">{hhmm(e.ts)} · {buy ? "Achat" : "Vente"}</div>
                </div>
                <span className="shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-semibold" style={{ color: VERDICT_COLORS[e.result.verdict], background: `${VERDICT_COLORS[e.result.verdict]}16` }}>
                  {e.result.verdict}
                </span>
                <div className="w-20 shrink-0 text-right font-mono text-[12.5px] font-semibold tabular-nums" style={{ color: margin >= 0 ? "#10B981" : "#EF4444" }}>
                  {formatEurSignedInt(margin)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}