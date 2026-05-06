import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

type Hover = { x: number; y: number; day: number; val: number };

export default function VolatilityViz() {
  const [ref, seen] = useInView(0.3);
  const pts = [22, 24, 21, 28, 18, 32, 14, 38, 9, 30, 22, 40, 12, 26];
  const W = 220;
  const H = 80;
  const path = pts.map((p, i) => `${(i / (pts.length - 1)) * W},${H - (p / 45) * 70}`).join(" ");
  const minIdx = pts.indexOf(Math.min(...pts));
  const minX = (minIdx / (pts.length - 1)) * W;
  const minY = H - (pts[minIdx] / 45) * 70;
  const [hover, setHover] = useState<Hover | null>(null);
  const [typed, setTyped] = useState<string>("");
  useEffect(() => {
    if (!seen) return;
    const target = "ZONE DE RISQUE";
    setTimeout(() => {
      let i = 0;
      const tick = () => {
        i++;
        setTyped(target.slice(0, i));
        if (i < target.length) setTimeout(tick, 38);
      };
      tick();
    }, 800);
  }, [seen]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const idx = Math.max(0, Math.min(pts.length - 1, Math.round((px / W) * (pts.length - 1))));
    setHover({ x: (idx / (pts.length - 1)) * W, y: H - (pts[idx] / 45) * 70, day: idx - 13, val: 480 + pts[idx] * 4 });
  };
  return (
    <svg
      ref={ref as unknown as React.RefObject<SVGSVGElement>}
      viewBox={"0 0 " + W + " " + H}
      className="w-full h-20"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="redzone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#EF4444" stopOpacity="0.3" />
          <stop offset="1" stopColor="#EF4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height="32" fill="url(#redzone)" style={{ opacity: seen ? (hover ? 0.95 : 0.6) : 0, transition: "opacity 600ms ease 800ms" }} />
      <line x1="0" y1="32" x2={W} y2="32" stroke="#EF4444" strokeOpacity="0.4" strokeDasharray="2 3" strokeWidth="1" />
      <path
        d={"M " + path}
        fill="none"
        stroke="#fafafa"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeDasharray="500"
        style={{ strokeDashoffset: seen ? 0 : 500, transition: "stroke-dashoffset 1600ms cubic-bezier(0.16,1,0.3,1)" }}
      />
      {seen && (
        <g style={{ opacity: 1, transition: "opacity 600ms ease 1700ms" }}>
          <line x1={minX} y1={minY - 4} x2={minX} y2={minY + 4} stroke="#EF4444" strokeWidth="1.2" />
          <line x1={minX} y1={minY + 8} x2={minX} y2={H - 2} stroke="#EF4444" strokeOpacity="0.25" strokeDasharray="1.5 2" />
          <text x={minX} y={H - 6} fill="#EF4444" fillOpacity="0.85" fontFamily="JetBrains Mono" fontSize="7" textAnchor="middle">J−14</text>
        </g>
      )}
      <text x="4" y="10" fill="#EF4444" fontFamily="JetBrains Mono" fontSize="8" opacity="0.85">{typed}</text>
      {hover && (
        <g>
          <line x1={hover.x} y1="0" x2={hover.x} y2={H} stroke="#fafafa" strokeOpacity="0.3" strokeDasharray="2 2" />
          <circle cx={hover.x} cy={hover.y} r="2.5" fill="#fafafa" />
          <rect x={Math.min(W - 58, Math.max(0, hover.x + 6))} y={Math.max(0, hover.y - 16)} width="54" height="14" rx="2" fill="#0A0A0B" stroke="#fafafa" strokeOpacity="0.2" />
          <text x={Math.min(W - 58, Math.max(0, hover.x + 6)) + 27} y={Math.max(0, hover.y - 16) + 10} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fill="#fafafa">{`J${hover.day >= 0 ? "+" : ""}${hover.day} · ${hover.val} €`}</text>
        </g>
      )}
    </svg>
  );
}