import { Boxes } from "lucide-react";

type Props = {
  onOpenAdd: () => void;
};

export default function StockEmptyState({ onOpenAdd }: Props) {
  return (
    <div className="mk-card-flat-soft flex flex-col items-center gap-5 px-6 py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: "rgba(59,130,246,0.10)",
          boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.22)",
        }}
      >
        <Boxes className="h-5 w-5" style={{ color: "#3B82F6" }} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="text-[15px] font-medium text-zinc-100">
          Aucun item en inventaire
        </div>
        <div className="max-w-md text-[13px] leading-relaxed text-zinc-400">
          Ajoutez votre premier item pour commencer à suivre votre stock,
          calculer votre marge réalisée et identifier les pièces qui dorment.
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenAdd}
        className="ease-expo flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
        style={{ background: "rgba(59,130,246,0.14)" }}
      >
        <span
          className="font-mono text-[12px] tracking-wider"
          style={{ color: "#3B82F6" }}
        >
          AJOUTER UN ITEM
        </span>
      </button>
    </div>
  );
}