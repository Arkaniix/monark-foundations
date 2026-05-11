import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { Skeleton } from "@/components/ui";
import { DashboardStatTile } from "@/components/dashboard/DashboardStatTile";
import type { DashboardOverview } from "@/components/dashboard/datasets";

/**
 * Page Dashboard — chantier C1.
 *
 * Section §01 (Vue d'ensemble) avec 4 stat tiles peuplées via dashboardApi.getOverview().
 * Comportement :
 *   - Au mount, fetch l'overview (mock ou real selon VITE_USE_MOCK_API)
 *   - Pendant le fetch : affiche 4 skeletons de la même forme que les tiles
 *   - Après succès : affiche les tiles avec Counter animé + sparkline 30j
 *   - En cas d'erreur : affiche un placeholder simple (sera amélioré en C3)
 *
 * Sections §02 (dernières estimations) et §03 (watchlist preview) arrivent en C2.
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
    <div className="flex flex-col gap-8">
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

      {/* Sections §02 et §03 arrivent en C2. */}
      <div className="font-mono text-[10px] tracking-wider text-zinc-700">
        // §02 — DERNIÈRES ESTIMATIONS · §03 — WATCHLIST PREVIEW · à venir (chantier C2)
      </div>
    </div>
  );
}
