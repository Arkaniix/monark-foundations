import { useCallback, useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { Skeleton } from "@/components/ui";
import { DashboardStatTile } from "@/components/dashboard/DashboardStatTile";
import { RecentEstimations } from "@/components/dashboard/RecentEstimations";
import { WatchlistPreview } from "@/components/dashboard/WatchlistPreview";
import { EmptyEstimations } from "@/components/dashboard/EmptyEstimations";
import { EmptyWatchlist } from "@/components/dashboard/EmptyWatchlist";
import { DashboardError } from "@/components/dashboard/DashboardError";
import type { DashboardOverview } from "@/components/dashboard/datasets";

/**
 * Page Dashboard — chantier C3a.
 *
 * Sections livrées :
 *   §01 Vue d'ensemble (4 stat tiles)
 *   §02 Dernières estimations (table OU empty state)
 *   §03 Watchlist preview (4 cards OU empty state)
 *
 * États gérés par le composant :
 *   - loading      → 3 skeletons sections
 *   - success      → rendu sections (avec empty inline si tableaux vides)
 *   - error        → DashboardError pleine page avec Retry
 *
 * Le state `empty` n'est pas un FetchState séparé : un fetch réussi qui
 * retourne des tableaux vides reste en `status: "success"`, et chaque
 * section décide elle-même d'afficher son empty state. Logique cohérente
 * avec la réalité backend (un user nouveau retourne `recent_estimations: []`
 * sans pour autant être en erreur).
 */

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: DashboardOverview }
  | { status: "error"; message: string };

export default function Dashboard() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await dashboardApi.getOverview();
      setState({ status: "success", data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialLoad = async () => {
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
    void initialLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  // Error state : pleine page, sortie courte-circuit (pas de skeleton ni de sections vides)
  if (state.status === "error") {
    return (
      <div className="flex flex-col gap-10">
        <DashboardError message={state.message} onRetry={load} />
      </div>
    );
  }

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
          {state.status === "loading" &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="mk-card flex flex-col gap-3 p-5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="mt-1 h-7 w-32 rounded" />
                <Skeleton className="mt-2 h-2 w-full rounded" />
              </div>
            ))}

          {state.status === "success" &&
            state.data.stats.map((stat) => (
              <DashboardStatTile key={stat.id} data={stat} />
            ))}
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

        {state.status === "success" &&
          (state.data.recent_estimations.length > 0 ? (
            <RecentEstimations data={state.data.recent_estimations} />
          ) : (
            <EmptyEstimations />
          ))}
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

        {state.status === "success" &&
          (state.data.watchlist_preview.length > 0 ? (
            <WatchlistPreview data={state.data.watchlist_preview} />
          ) : (
            <EmptyWatchlist />
          ))}
      </section>
    </div>
  );
}
