type ScoreBarProps = { label: string; weight: string; value: number; color: string };

export default function ScoreBar({ label, weight, value, color }: ScoreBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between text-[11.5px] mb-1">
        <div className="text-zinc-300">{label} <span className="font-mono text-zinc-600">· {weight}</span></div>
        <div className="font-mono text-zinc-300">{Math.round(pct)}</div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full ease-expo" style={{ width: pct + "%", background: color, transition: "width 800ms" }} />
      </div>
    </div>
  );
}

export { ScoreBar };