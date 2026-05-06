type ConfidenceGaugeProps = { value: number; color: string };

export default function ConfidenceGauge({ value, color }: ConfidenceGaugeProps) {
  const r = 22, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative w-16 h-16 mt-2">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 32 32)" strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] font-semibold">{value}%</div>
    </div>
  );
}

export { ConfidenceGauge };