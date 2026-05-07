import MicroSpark from "./MicroSpark";
import type { Ticker } from "./tickers";

type Props = { t: Ticker };

export default function TickerCell({ t }: Props) {
  const up = t.pct >= 0;
  const color = up ? "#10B981" : "#EF4444";
  return (
    <div className="flex items-center gap-3 font-mono text-[12px] whitespace-nowrap">
      <span className="text-zinc-300">{t.name}</span>
      <span style={{ color }}>
        {up ? "▲" : "▼"} {up ? "+" : ""}{t.pct.toFixed(1)}%
      </span>
      <span className="text-zinc-400">{t.price}</span>
      <MicroSpark pct={t.pct} color={color} />
    </div>
  );
}