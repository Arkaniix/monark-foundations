import { History } from "lucide-react";

type EstimatorHistoryButtonProps = {
  count: number;
  onClick: () => void;
};

export default function EstimatorHistoryButton({
  count,
  onClick,
}: EstimatorHistoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ouvrir l'historique (${count} évaluation${count > 1 ? "s" : ""})`}
      className="flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-white/[0.05]"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "0.5px solid rgba(255,255,255,0.10)",
      }}
    >
      <History className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.8} />
      <span className="font-mono text-[11px] tracking-[0.1em] text-zinc-300">
        HISTORIQUE
      </span>
      {count > 0 && (
        <span
          className="font-mono text-[10.5px] tabular-nums"
          style={{
            background: "rgba(59,130,246,0.15)",
            color: "#60a5fa",
            padding: "1px 7px",
            borderRadius: "10px",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export { EstimatorHistoryButton };