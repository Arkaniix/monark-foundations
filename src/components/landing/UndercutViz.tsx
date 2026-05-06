import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

export default function UndercutViz() {
  const [ref, seen] = useInView(0.3);
  const dist = [3, 5, 8, 12, 18, 22, 28, 30, 26, 20, 14, 9, 5, 3];
  const [showOutlier, setShowOutlier] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [hover, setHover] = useState<{ x: number } | null>(null);
  useEffect(() => {
    if (!seen) return;
    const t1 = setTimeout(() => setShowOutlier(true), 1200);
    const t2 = setTimeout(() => setShowLabel(true), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [seen]);
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 220;
    setHover({ x: px });
  };
  return (
    <svg
      ref={ref as unknown as React.RefObject<SVGSVGElement>}
      viewBox="0 0 220 80"
      className="w-full h-20"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {dist.map((d, i) => (
        <rect
          key={i}
          x={i * 15 + 1}
          y={80 - d * 2.4}
          width={11}
          height={d * 2.4}
          fill="#fafafa"
          fillOpacity="0.18"
          rx="1"
          style={{
            transformOrigin: `${i * 15 + 6.5}px 80px`,
            transform: seen ? "scaleY(1)" : "scaleY(0)",
            opacity: seen ? 1 : 0,
            transition: `transform 400ms cubic-bezier(0.16,1,0.3,1) ${i * 18}ms, opacity 400ms ease ${i * 18}ms`,
          }}
        />
      ))}
      <g style={{ opacity: showOutlier ? 1 : 0, transition: "opacity 700ms ease" }}>
        <line x1="32" y1="0" x2="32" y2="80" stroke="#10B981" strokeOpacity="0.35" strokeDasharray="2 3" strokeWidth="1" />
        <line x1="29" y1="80" x2="35" y2="80" stroke="#10B981" strokeWidth="1.4" />
      </g>
      <text
        x="42"
        y="12"
        fill="#10B981"
        fillOpacity="0.95"
        fontFamily="JetBrains Mono"
        fontSize="8"
        style={{ opacity: showLabel ? 1 : 0, transition: "opacity 500ms ease" }}
      >
        −27 % vs médiane composite (271 €)
      </text>
      {hover && (
        <line x1={hover.x} y1="0" x2={hover.x} y2="80" stroke="#fafafa" strokeOpacity="0.25" strokeDasharray="2 2" />
      )}
    </svg>
  );
}