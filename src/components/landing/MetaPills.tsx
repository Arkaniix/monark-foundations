type Props = { items: string[] };

export default function MetaPills({ items }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((p, i) => (
        <span key={i} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">{p}</span>
      ))}
    </div>
  );
}