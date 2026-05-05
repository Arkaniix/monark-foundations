type PillProps = {
  label: string;
  color: string;
};

export function Pill({ label, color }: PillProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-xs uppercase tracking-wider border"
      style={{
        backgroundColor: color + "10",
        borderColor: color + "55",
        color,
      }}
    >
      {label}
    </span>
  );
}

export default Pill;