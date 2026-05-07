import { useMemo } from "react";

type Props = { pct: number; w?: number; h?: number; color: string };

export default function MicroSpark({ pct, w = 32, h = 12, color }: Props) {
  const seed = Math.abs(pct * 100) | 0;
  const pts = useMemo(() => {
    let v = 50;
    const arr: number[] = [];
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 12; i++) {
      v += (rand() - 0.5) * 14 + (pct >= 0 ? 1.0 : -1.0);
      arr.push(v);
    }
    const min = Math.min(...arr), max = Math.max(...arr), span = max - min || 1;
    return arr
      .map((y, i) => `${(i / (arr.length - 1)) * w},${h - 1 - ((y - min) / span) * (h - 2)}`)
      .join(" ");
  }, [seed, pct, w, h]);
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.85"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}