type Props = {
  title: string;
  description: string;
  patchLabel: string;
};

export default function StockPlaceholderTab({
  title,
  description,
  patchLabel,
}: Props) {
  return (
    <div className="mk-card-flat-soft flex flex-col items-center gap-5 px-6 py-20 text-center">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1"
        style={{
          background: "rgba(255,255,255,0.03)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#52525B" }} />
        <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500">
          {patchLabel} · PROCHAINEMENT
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="text-[15px] font-medium text-zinc-100">{title}</div>
        <div className="max-w-md text-[13px] leading-relaxed text-zinc-400">
          {description}
        </div>
      </div>
    </div>
  );
}