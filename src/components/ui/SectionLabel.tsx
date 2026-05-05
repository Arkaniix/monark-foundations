type SectionLabelProps = {
  idx: number;
  label: string;
};

export function SectionLabel({ idx, label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 uppercase tracking-widest">
      <span className="text-zinc-600">{String(idx).padStart(2, "0")}</span>
      <span className="h-px w-8 bg-zinc-700" />
      <span>{label}</span>
    </div>
  );
}

export default SectionLabel;