import TickerCell from "./TickerCell";
import type { Ticker } from "./tickers";

type Props = { items: Ticker[]; duration: number; opacity: number };

export default function TickerLane({ items, duration, opacity }: Props) {
  const doubled = [...items, ...items];
  return (
    <div className="auth-ticker-lane overflow-hidden" style={{ opacity }}>
      <div className="auth-ticker-track" style={{ animationDuration: `${duration}s` }}>
        {doubled.map((t, i) => (
          <TickerCell key={i} t={t} />
        ))}
      </div>
    </div>
  );
}
