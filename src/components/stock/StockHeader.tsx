type Props = {
  onOpenAdd: () => void;
};

export default function StockHeader({ onOpenAdd }: Props) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
            INVENTAIRE V1
          </div>
          <div className="h-px w-10 bg-white/10" />
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
            STOCK MANAGER
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-100 md:text-3xl">
          Inventaire
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Inventaire personnel, marge réalisée, alertes pièces dormantes.
          Toute la donnée reste locale dans votre navigateur.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenAdd}
        className="ease-expo flex items-center justify-center gap-2 rounded-md px-4 py-2.5 transition-colors"
        style={{
          background: "rgba(59,130,246,0.14)",
          boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.3)",
        }}
      >
        <span
          className="font-mono text-[12px] tracking-wider"
          style={{ color: "#3B82F6" }}
        >
          + AJOUTER UN ITEM
        </span>
      </button>
    </header>
  );
}