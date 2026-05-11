import { Eye, ArrowRight } from "lucide-react";

type EmptyWatchlistProps = {
  onBrowseCatalogue?: () => void;
};

/**
 * Empty state riche pour la section §03 — Watchlist preview.
 *
 * Conçu pour un user qui n'a encore suivi aucun modèle. C'est typiquement
 * la deuxième étape d'onboarding après les premières estimations.
 *
 * Composition :
 *   - Icône Eye dans un cercle vert translucide (illustration micro)
 *   - Titre orienté repérage proactif
 *   - Description qui explique la valeur de la watchlist (alertes, tendances)
 *   - CTA primaire "Parcourir le catalogue"
 *   - Hint secondaire sur les notifications
 */
export function EmptyWatchlist({ onBrowseCatalogue }: EmptyWatchlistProps) {
  const handleBrowse = () => {
    if (onBrowseCatalogue) {
      onBrowseCatalogue();
    } else {
      // TODO : naviguer vers /catalogue quand la route existera
      console.log("Empty watchlist CTA → /catalogue");
    }
  };

  return (
    <div className="mk-card flex flex-col items-center gap-5 px-6 py-10 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: "rgba(16,185,129,0.10)",
          boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.22)",
        }}
      >
        <Eye className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[15px] font-medium text-zinc-100">
          Watchlist vide
        </div>
        <div className="max-w-md text-[13px] leading-relaxed text-zinc-400">
          Suivez les modèles qui vous intéressent et soyez notifié des
          mouvements de prix significatifs. Idéal pour repérer un GPU avant
          qu'il ne flambe ou détecter un creux de marché.
        </div>
      </div>

      <button
        type="button"
        onClick={handleBrowse}
        className="ease-expo group flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
        style={{ background: "rgba(16,185,129,0.14)" }}
      >
        <span className="font-mono text-[12px] tracking-wider text-emerald-300 transition-colors group-hover:text-emerald-200">
          PARCOURIR LE CATALOGUE
        </span>
        <ArrowRight
          className="h-3.5 w-3.5 text-emerald-400 transition-colors group-hover:text-emerald-300"
          strokeWidth={2}
        />
      </button>
    </div>
  );
}

export default EmptyWatchlist;
