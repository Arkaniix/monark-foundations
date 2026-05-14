import { Eye } from "lucide-react";
import FadeInSection from "@/components/ui/FadeInSection";

/**
 * Page Watchlist V1 — stub.
 *
 * Sera complétée en P2 (tabs Favoris/Alertes + table dense) et P3 (drawer
 * quick view).
 *
 * Consomme :
 *   - `monark.catalog.favorites.v1` via `useCatalogFavorites`
 *   - `monark.catalog.alerts.v2` via `useCatalogAlerts` (migration auto depuis v1)
 */
export default function Watchlist() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
            WATCHLIST V1
          </div>
          <div className="h-px w-10 bg-white/10" />
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
            MODÈLES SUIVIS
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-100 md:text-3xl">
          Watchlist
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-500">
          Modèles épinglés et alertés. Suivez les mouvements de prix sans rouvrir
          le catalogue.
        </p>
      </header>

      <FadeInSection delay={0}>
        <div className="mk-card-flat-soft flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "0.5px solid rgba(59,130,246,0.3)",
            }}
          >
            <Eye className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="font-mono text-[11px] tracking-[0.18em] text-zinc-400">
            PAGE EN CONSTRUCTION
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-500">
            La page Watchlist arrive au prochain patch. Les fondations
            (migration alerts v1 → v2, hook <code className="font-mono text-xs text-zinc-400">useCatalogAlerts</code> avec
            snapshots) sont en place.
          </p>
        </div>
      </FadeInSection>
    </div>
  );
}