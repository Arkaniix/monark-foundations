type SectionLabelProps = {
  idx: number;
  label: string;
};

export function SectionLabel({ idx, label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
        § {String(idx).padStart(2, "0")}
      </div>
      <div className="h-px w-10 bg-white/10" />
      <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

export default SectionLabel;