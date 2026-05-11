import { Search, ArrowRight } from "lucide-react";

type EmptyEstimationsProps = {
  onStartEstimator?: () => void;
};

/**
 * Empty state riche pour la section §02 — Dernières estimations.
 *
 * Conçu pour un user qui vient de signer et n'a encore rien estimé.
 * Objectif : transformer le "vide" en moteur d'action.
 *
 * Composition :
 *   - Icône Search dans un cercle bleu translucide (illustration micro)
 *   - Titre chaleureux orienté action
 *   - Description courte qui rappelle la valeur de l'estimateur
 *   - CTA primaire "Lancer une estimation" avec ArrowRight
 *   - CTA secondaire (lien texte) "ou installer la Lens"
 *
 * Layout : mk-card pleine largeur, contenu centré vertical, padding aéré.
 */
export function EmptyEstimations({ onStartEstimator }: EmptyEstimationsProps) {
  const handleStart = () => {
    if (onStartEstimator) {
      onStartEstimator();
    } else {
      // TODO : naviguer vers /estimator quand la route existera
      console.log("Empty estimations CTA → /estimator");
    }
  };

  return (
    <div className="mk-card flex flex-col items-center gap-5 px-6 py-10 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: "rgba(59,130,246,0.10)",
          boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.22)",
        }}
      >
        <Search className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[15px] font-medium text-zinc-100">
          Aucune estimation pour l'instant
        </div>
        <div className="max-w-md text-[13px] leading-relaxed text-zinc-400">
          Évaluez votre première annonce en quelques secondes — l'Estimateur
          compare le prix à la médiane du marché et donne un verdict actionnable.
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleStart}
          className="ease-expo group flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
          style={{ background: "rgba(59,130,246,0.14)" }}
        >
          <span className="font-mono text-[12px] tracking-wider text-blue-300 transition-colors group-hover:text-blue-200">
            LANCER UNE ESTIMATION
          </span>
          <ArrowRight
            className="h-3.5 w-3.5 text-blue-400 transition-colors group-hover:text-blue-300"
            strokeWidth={2}
          />
        </button>
        <div className="font-mono text-[11px] text-zinc-600">
          ou installez la Lens pour les annonces LBC / Vinted
        </div>
      </div>
    </div>
  );
}

export default EmptyEstimations;
