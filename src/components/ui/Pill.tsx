type PillProps = {
  label: string;
  color: string;
};

export function Pill({ label, color }: PillProps) {
  return (
    <span
      className="font-mono text-[10.5px] px-2 py-0.5 rounded-full border"
      style={{
        color,
        borderColor: color + "55",
        background: color + "10",
      }}
    >
      {label}
    </span>
  );
}

export default Pill;