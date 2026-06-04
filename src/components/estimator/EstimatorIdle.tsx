import { VerdictCrystal } from "@/components/ui";

type EstimatorIdleProps = {
  pending?: boolean;
};

export default function EstimatorIdle({ pending = false }: EstimatorIdleProps) {
  return (
    <div className="mk-card p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[420px]">
      <div className={(pending ? "" : "opacity-30") + " crystal-pop crystal-float"}>
        <VerdictCrystal color={pending ? "#3B82F6" : "#52525B"} size={120} />
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-zinc-500">
        {pending && (
          <span
            aria-hidden="true"
            className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
          />
        )}
        {pending ? "ANALYSE EN COURS" : "EN ATTENTE D'INPUT"}
      </div>

      <div className="text-[13px] text-zinc-500 max-w-sm leading-relaxed">
        {pending
          ? "Composition du verdict à partir des observations sold composite des 180 derniers jours…"
          : "Renseigne le modèle, l'état, le prix demandé et la plateforme. L'Estimator compose un verdict actionnable basé sur les ventes sold composite des 180 derniers jours."}
      </div>
    </div>
  );
}

export { EstimatorIdle };