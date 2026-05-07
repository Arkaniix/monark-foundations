import { useMemo } from "react";
import { TICKERS, type Ticker } from "./tickers";
import TickerLane from "./TickerLane";

type Lane = { items: Ticker[]; duration: number; opacity: number };

export default function BackgroundTicker() {
  const lanes = useMemo<Lane[]>(() => {
    const rotate = (arr: Ticker[], k: number) => arr.slice(k).concat(arr.slice(0, k));
    return [
      { items: rotate(TICKERS, 0),  duration: 95, opacity: 0.30 },
      { items: rotate(TICKERS, 5),  duration: 70, opacity: 0.24 },
      { items: rotate(TICKERS, 9),  duration: 80, opacity: 0.18 },
      { items: rotate(TICKERS, 2),  duration: 60, opacity: 0.20 },
      { items: rotate(TICKERS, 7),  duration: 88, opacity: 0.26 },
      { items: rotate(TICKERS, 12), duration: 76, opacity: 0.32 },
    ];
  }, []);

  return (
    <div className="absolute inset-0 z-0 auth-ticker-mask pointer-events-none select-none">
      <div className="absolute inset-0 flex flex-col justify-evenly py-10">
        {lanes.map((l, i) => (
          <div key={i} className={i >= 3 ? "lane-extra" : ""}>
            <TickerLane items={l.items} duration={l.duration} opacity={l.opacity} />
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .lane-extra { display: none; }
        }
      `}</style>
    </div>
  );
}
