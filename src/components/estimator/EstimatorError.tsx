import { AlertCircle, RefreshCw } from "lucide-react";

type EstimatorErrorProps = {
  message: string;
  code?: number;
  onRetry?: () => void;
};

export default function EstimatorError({
  message,
  code,
  onRetry,
}: EstimatorErrorProps) {
  const is402 = code === 402;
  const title = is402 ? "Crédits insuffisants" : "Évaluation impossible";
  const displayMessage = is402
    ? "Ton solde de crédits ne permet pas de lancer cette estimation."
    : message;
  return (
    <div className="mk-card flex flex-col items-center gap-5 px-6 py-10 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: "rgba(239,68,68,0.10)",
          boxShadow: "inset 0 0 0 1px rgba(239,68,68,0.22)",
        }}
      >
        <AlertCircle className="h-5 w-5 text-red-400" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[15px] font-medium text-zinc-100">
          {title}
        </div>
        <div className="mt-1 font-mono text-[11px] text-zinc-500 max-w-md">
          {displayMessage}
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ease-expo group flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <RefreshCw
            className="ease-expo h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:rotate-180 group-hover:text-zinc-200"
            strokeWidth={2}
          />
          <span className="font-mono text-[12px] tracking-wider text-zinc-300 transition-colors group-hover:text-zinc-100">
            RÉESSAYER
          </span>
        </button>
      )}
    </div>
  );
}

export { EstimatorError };