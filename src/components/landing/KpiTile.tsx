type KpiTileProps = {
  label: string;
  value: string;
  revealed: boolean;
  accent?: string;
  bar?: number;
};

export default function KpiTile({ label, value, revealed, accent, bar }: KpiTileProps) {
  return (
    <div
      className="rounded-md bg-white/[0.03] border border-white/5 p-2 ease-expo"
      style={{
        opacity: revealed ? 1 : 0.2,
        transform: revealed ? "translateY(0)" : "translateY(6px)",
        transition: "all 300ms",
      }}
    >
      <div className="font-mono text-[8.5px] text-zinc-500 tracking-wider">{label}</div>
      <div className="font-mono text-[13px] font-semibold mt-0.5" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {bar !== undefined && (
        <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-300 ease-expo"
            style={{ width: revealed ? bar * 100 + "%" : "0%", transition: "width 700ms" }}
          />
        </div>
      )}
    </div>
  );
}