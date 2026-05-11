import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { Skeleton } from "@/components/ui";
import { DashboardStatTile } from "@/components/dashboard/DashboardStatTile";
import { RecentEstimations } from "@/components/dashboard/RecentEstimations";
import { WatchlistPreview } from "@/components/dashboard/WatchlistPreview";
import type { DashboardOverview } from "@/components/dashboard/datasets";

/**
 * Page Dashboard — chantier C2b.
 *
 * Sections livrées :
 *   §01 Vue d'ensemble (4 stat tiles)
 *   §02 Dernières estimations (table compacte 5 lignes, 6 colonnes)
 *   §03 Watchlist preview (4 cards horizontales avec sparkline 7j)
 *
 * États empty/loading/error détaillés arrivent en C3.
 */

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: DashboardOverview }
  | { status: "error"; message: string };

export default function Dashboard() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await dashboardApi.getOverview();
        if (cancelled) return;
        setState({ status: "success", data });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Erreur de chargement";
        setState({ status: "error", message });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {/* §01 — Vue d'ensemble */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
            § 01
          </div>
          <div className="h-px w-10 bg-white/10" />
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
            VUE D'ENSEMBLE
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {state.status === "loading" && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="mk-card flex flex-col gap-3 p-5">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="mt-1 h-7 w-32 rounded" />
                  <Skeleton className="mt-2 h-2 w-full rounded" />
                </div>
              ))}
            </>
          )}

          {state.status === "success" &&
            state.data.stats.map((stat) => (
              <DashboardStatTile key={stat.id} data={stat} />
            ))}

          {state.status === "error" && (
            <div className="mk-card col-span-full p-6">
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
                ERREUR
              </div>
              <div className="mt-2 text-[13px] text-zinc-300">
                Impossible de charger la vue d'ensemble.
              </div>
              <div className="mt-1 font-mono text-[11px] text-zinc-600">
                {state.message}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* §02 — Dernières estimations */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
            § 02
          </div>
          <div className="h-px w-10 bg-white/10" />
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
            DERNIÈRES ESTIMATIONS
          </div>
        </div>

        {state.status === "loading" && (
          <div className="mk-card overflow-hidden">
            <div
              className="px-5 py-3"
              style={{ borderBottom: "1px solid var(--mk-divider-soft)" }}
            >
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3"
                style={{
                  borderBottom:
                    i === 4 ? "none" : "1px solid var(--mk-divider-soft)",
                }}
              >
                <Skeleton className="h-4 w-40 rounded" />
                <div className="flex-1" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        )}

        {state.status === "success" && (
          <RecentEstimations data={state.data.recent_estimations} />
        )}

        {state.status === "error" && (
          <div className="mk-card p-6">
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
              ERREUR
            </div>
            <div className="mt-2 text-[13px] text-zinc-300">
              Impossible de charger les estimations.
            </div>
          </div>
        )}
      </section>

      {/* §03 — Watchlist preview */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
            § 03
          </div>
          <div className="h-px w-10 bg-white/10" />
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
            WATCHLIST
          </div>
        </div>

        {state.status === "loading" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mk-card flex flex-col gap-3 p-5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="mt-1 h-7 w-24 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="mt-2 h-7 w-full rounded" />
              </div>
            ))}
          </div>
        )}

        {state.status === "success" && (
          <WatchlistPreview data={state.data.watchlist_preview} />
        )}

        {state.status === "error" && (
          <div className="mk-card p-6">
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
              ERREUR
            </div>
            <div className="mt-2 text-[13px] text-zinc-300">
              Impossible de charger la watchlist.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
