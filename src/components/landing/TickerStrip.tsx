import { TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "@/components/ui";

type TickerItem = { name: string; chg: number; price: number; spark: number[] };

const TICKER_ITEMS: TickerItem[] = [
  { name: "RTX 4070 Ti", chg: 3.2, price: 442, spark: [10,11,9,12,11,13,14,13,15] },
  { name: "R7 7800X3D", chg: -1.8, price: 339, spark: [15,14,15,13,12,13,12,11,11] },
  { name: "RTX 4090", chg: 1.4, price: 1580, spark: [20,21,20,22,23,22,24,23,24] },
  { name: "DDR5 32 Go", chg: -0.6, price: 98, spark: [12,12,11,12,11,11,10,11,10] },
  { name: "B650 Tomahawk", chg: 2.1, price: 159, spark: [9,10,11,10,12,11,13,12,13] },
  { name: "RX 7800 XT", chg: 0.9, price: 412, spark: [11,11,12,11,12,13,12,13,12] },
  { name: "i7-13700K", chg: -2.4, price: 268, spark: [14,14,13,14,12,13,12,11,11] },
  { name: "SSD 2 To NVMe", chg: 1.1, price: 124, spark: [10,11,10,11,12,11,12,12,12] },
  { name: "RTX 3090", chg: -3.1, price: 612, spark: [18,17,18,16,15,16,15,14,14] },
  { name: "R5 7600", chg: 0.4, price: 188, spark: [11,11,12,11,11,12,11,12,12] },
  { name: "X670E Hero", chg: 4.6, price: 388, spark: [9,10,11,12,13,12,14,15,16] },
  { name: "RM850x", chg: -0.2, price: 132, spark: [12,12,11,12,12,11,12,11,11] },
];

export default function TickerStrip() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap relative h-11 bg-zinc-950 border-y border-white/5 overflow-hidden edge-mask">
      <div className="absolute top-0 left-0 h-full ticker-track flex items-center gap-8 whitespace-nowrap pl-8">
        {items.map((it, i) => {
          const up = it.chg > 0;
          const color = up ? "#10B981" : "#EF4444";
          return (
            <div key={i} className="flex items-center gap-3 font-mono text-[12px]">
              <span className="text-zinc-300">{it.name}</span>
              <span className="flex items-center gap-1" style={{ color }}>
                {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {(up ? "+" : "") + it.chg.toFixed(1)}%
              </span>
              <Sparkline points={it.spark} color={color} w={48} h={16} />
              <span className="text-zinc-100 font-medium">{it.price.toLocaleString("fr-FR")} €</span>
              <span className="text-zinc-700">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}