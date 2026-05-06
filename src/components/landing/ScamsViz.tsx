import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

type Cell = { r: number; c: number; intensity: number };
type Hover = { r: number; c: number; k: number };

export default function ScamsViz() {
  const [ref, seen] = useInView(0.3);
  const ROWS = 5;
  const COLS = 14;
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const intensity = Math.min(1, Math.max(0, (Math.sin(r * 1.3 + c * 0.7) + 1) / 2));
      cells.push({ r, c, intensity });
    }
  }
  const [flashes, setFlashes] = useState<Record<number, number>>({});
  const [hover, setHover] = useState<Hover | null>(null);
  useEffect(() => {
    if (!seen) return;
    let stop = false;
    const flash = () => {
      if (stop) return;
      const k = Math.floor(Math.random() * cells.length);
      setFlashes((f) => ({ ...f, [k]: Date.now() }));
      setTimeout(() => setFlashes((f) => { const n = { ...f }; delete n[k]; return n; }), 700);
      setTimeout(flash, 1500 + Math.random() * 3000);
    };
    setTimeout(flash, 3000);
    return () => { stop = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);
  return (
    <svg
      ref={ref as unknown as React.RefObject<SVGSVGElement>}
      viewBox="0 0 220 80"
      className="w-full h-20"
      onMouseLeave={() => setHover(null)}
    >
      {cells.map((c, k) => {
        const delay = (c.r + c.c) * 12;
        const baseOp = 0.05 + c.intensity * 0.55;
        const isFlash = flashes[k];
        const adjacent = hover && Math.abs(hover.r - c.r) <= 1 && Math.abs(hover.c - c.c) <= 1 && !(hover.r === c.r && hover.c === c.c);
        const fillOp = hover && hover.r === c.r && hover.c === c.c ? 1 : (adjacent ? Math.min(0.85, baseOp + 0.2) : (isFlash ? 0.95 : baseOp));
        const fill = hover && hover.r === c.r && hover.c === c.c ? "#fafafa" : "#EF4444";
        return (
          <g key={k} onMouseEnter={() => setHover({ r: c.r, c: c.c, k })}>
            <rect
              x={c.c * 15}
              y={c.r * 15}
              width={13}
              height={13}
              fill={fill}
              fillOpacity={fillOp}
              rx="1.5"
              style={{
                opacity: seen ? 1 : 0,
                transform: seen ? "scale(1)" : "scale(0.5)",
                transformOrigin: `${c.c * 15 + 6.5}px ${c.r * 15 + 6.5}px`,
                transition: `opacity 200ms ease ${delay}ms, transform 200ms ease ${delay}ms, fill-opacity 220ms ease`,
              }}
            />
            {hover && hover.k === k && (
              <rect x={c.c * 15 - 1} y={c.r * 15 - 1} width="15" height="15" fill="none" stroke="#fafafa" strokeWidth="0.8" rx="2" />
            )}
          </g>
        );
      })}
      {hover && (
        <g>
          <rect x={Math.min(220 - 94, hover.c * 15 + 18)} y={Math.max(0, hover.r * 15 - 10)} width="90" height="16" rx="2" fill="#0A0A0B" stroke="#EF4444" strokeOpacity="0.4" />
          <text x={Math.min(220 - 94, hover.c * 15 + 18) + 45} y={Math.max(0, hover.r * 15 - 10) + 11} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fill="#fafafa">{`${10 + (hover.k % 20)} scams détectés (24h)`}</text>
        </g>
      )}
    </svg>
  );
}