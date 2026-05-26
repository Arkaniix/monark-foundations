import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
 * Page Dashboard.
 *
 * Sections livrées :
 *   §01 Vue d'ensemble (4 stat tiles)
 *   §02 Dernières estimations (table OU empty state)
 *   §03 Watchlist preview (4 cards OU empty state)
 *
 * États gérés :
 *   - loading  → 3 skeletons sections
 *   - success  → rendu sections (empty inline si tableaux vides)
 *   - error    → DashboardError pleine page avec Retry
 *
 * Prop `__devForceState` (préfixe __ pour signaler usage dev) : court-circuite
 * le fetch et force un état spécifique. Utilisé exclusivement par la route
 * /_dev/dashboard-states pour visualiser les 4 états sans manipuler les
 * fixtures mock. **Ne pas utiliser en production.**
 */

export type FetchState =
  | { status: "loading" }
  | { status: "success"; data: DashboardOverview }
  | { status: "error"; message: string };

type DashboardProps = {
  __devForceState?: FetchState;
};

export default function Dashboard({ __devForceState }: DashboardProps = {}) {
  const [state, setState] = useState<FetchState>(
    __devForceState ?? { status: "loading" },
  );
  const navigate = useNavigate();

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
    // Mode dev : on suit __devForceState à chaque changement, pas de fetch
    if (__devForceState) {
      setState(__devForceState);
      return;
    }

    // Mode production : fetch normal au mount
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
  }, [__devForceState]);

  // Error state : pleine page, court-circuit
  if (state.status === "error") {
    // En mode dev, retry réinitialise à __devForceState au lieu de fetcher
    const retryHandler = __devForceState
      ? () => setState(__devForceState)
      : load;
    return (
      <div className="flex flex-col gap-10">
        <DashboardError message={state.message} onRetry={retryHandler} />
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
            <EmptyEstimations onStartEstimator={() => navigate({ to: "/estimator" })} />
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
            <EmptyWatchlist onBrowseCatalogue={() => navigate({ to: "/catalogue" })} />
          ))}
      </section>
    </div>
  );
}
