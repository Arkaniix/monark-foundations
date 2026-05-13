import { AlertCircle } from "lucide-react";

type EstimatorCapBlockModalProps = {
  isOpen: boolean;
  cap: number;
  onClose: () => void;
  onOpenHistory: () => void;
};

export default function EstimatorCapBlockModal({
  isOpen,
  cap,
  onClose,
  onOpenHistory,
}: EstimatorCapBlockModalProps) {
  if (!isOpen) return null;

  const handleOpenHistory = () => {
    onClose();
    onOpenHistory();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cap-block-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
        style={{
          background: "#0A0A0B",
          border: "0.5px solid rgba(239,68,68,0.30)",
          borderRadius: "10px",
          padding: "28px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        <div className="flex items-start gap-3.5 mb-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
            style={{
              background: "rgba(239,68,68,0.10)",
              border: "0.5px solid rgba(239,68,68,0.25)",
            }}
            aria-hidden="true"
          >
            <AlertCircle className="h-4 w-4" style={{ color: "#EF4444" }} strokeWidth={2} />
          </div>
          <div>
            <div
              className="font-mono text-[10.5px] tracking-[0.2em] mb-1.5"
              style={{ color: "#EF4444" }}
            >
              HISTORIQUE PLEIN
            </div>
            <div
              id="cap-block-title"
              className="text-[15px] font-medium leading-snug text-zinc-200"
            >
              Limite de {cap} évaluations atteinte
            </div>
          </div>
        </div>

        <p className="text-[13px] text-zinc-400 leading-relaxed mb-6">
          Pour lancer cette nouvelle évaluation, libère de la place en
          supprimant une ou plusieurs entrées de ton historique.
        </p>

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-[12.5px] text-zinc-400 transition-colors hover:bg-white/[0.05]"
            style={{
              background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.10)",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleOpenHistory}
            className="rounded-md px-4 py-2 text-[12.5px] font-medium transition-colors hover:bg-blue-500/[0.15]"
            style={{
              background: "rgba(59,130,246,0.10)",
              border: "0.5px solid rgba(59,130,246,0.30)",
              color: "#60a5fa",
            }}
          >
            Ouvrir l'historique
          </button>
        </div>
      </div>
    </div>
  );
}

export { EstimatorCapBlockModal };