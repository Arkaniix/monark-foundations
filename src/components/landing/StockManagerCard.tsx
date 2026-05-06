import { useState, useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { STOCK_ROWS, type StockRow } from "./stockData";

export default function StockManagerCard() {
  const pnlPoints = [120, 142, 134, 168, 192, 188, 224, 240, 232, 268, 290, 282, 312, 348];
  const [ref, seen] = useInView(0.25);
  const [rows, setRows] = useState<StockRow[]>(STOCK_ROWS);
  const [pulseIdx, setPulseIdx] = useState<number | null>(null);
  const [badge, setBadge] = useState<{ idx: number; val: number } | null>(null);
  const [toast, setToast] = useState<{ k: number; txt: string } | null>(null);
  const toastKey = useRef(0);

  useEffect(() => {
    let stop = false;
    const tick = () => {
      if (stop) return;
      const idx = Math.floor(Math.random() * rows.length);
      const delta = Math.floor(Math.random() * 15) + 4;
      setRows(rs => rs.map((r, i) => i === idx ? { ...r, profit: r.profit + delta } : r));
      setPulseIdx(idx);
      setBadge({ idx, val: delta });
      setTimeout(() => setBadge(null), 1000);
      setTimeout(() => setPulseIdx(null), 600);
      setTimeout(tick, 6000 + Math.random() * 1500);
    };
    setTimeout(tick, 4000);
    return () => { stop = true; };
  }, [rows.length]);

  useEffect(() => {
    let stop = false;
    const fire = () => {
      if (stop) return;
      toastKey.current++;
      const items = [
        "RTX 4070 Ti · +62 €",
        "R7 7800X3D · +49 €",
        "DDR5 32 Go · +22 €",
        "B650 Tomahawk · +18 €",
      ];
      setToast({ k: toastKey.current, txt: items[Math.floor(Math.random() * items.length)] });
      setTimeout(() => setToast(null), 3200);
      setTimeout(fire, 25000 + Math.random() * 5000);
    };
    setTimeout(fire, 8000);
    return () => { stop = true; };
  }, []);

  const W = 520, H = 64;
  const max = Math.max(...pnlPoints), min = Math.min(...pnlPoints);
  const path = pnlPoints.map((p, i) => `${(i / (pnlPoints.length - 1)) * W},${H - ((p - min) / (max - min)) * H}`).join(" L");
  const lastX = W, lastY = H - ((pnlPoints[pnlPoints.length - 1] - min) / (max - min)) * H;

  return (
    <div ref={ref as unknown as React.RefObject<HTMLDivElement>} className="mk-card p-6 relative">
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-1">STOCK MANAGER</div>
            <div className="text-[18px] font-semibold tracking-tight">P&amp;L cumulé · 14 derniers jours</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] text-zinc-500">CUMULÉ</div>
            <div className="font-mono text-[20px] font-semibold text-emerald-400">+1 248 €</div>
          </div>
        </div>
        <div className="rounded-md bg-black/30 p-3 mb-4 relative">
          <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full overflow-visible" preserveAspectRatio="none" style={{ height: H + 8 }}>
            <defs>
              <linearGradient id="pnl-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="1" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`M0,${H} L${path} L${W},${H} Z`} fill="url(#pnl-grad)" style={{ opacity: seen ? 1 : 0, transition: "opacity 800ms ease 600ms" }} />
            <path d={`M${path}`} fill="none" stroke="#10B981" strokeWidth="1.6"
              strokeDasharray="2000"
              style={{ strokeDashoffset: seen ? 0 : 2000, transition: "stroke-dashoffset 1400ms cubic-bezier(0.16,1,0.3,1)" }} />
            {seen && (
              <g style={{ opacity: 1, transition: "opacity 600ms ease 1500ms" }}>
                <line x1={lastX} y1={lastY - 5} x2={lastX} y2={lastY + 5} stroke="#10B981" strokeWidth="1.4" />
                <text x={lastX - 4} y={lastY - 8} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="#10B981" fillOpacity="0.95">+348 €</text>
              </g>
            )}
          </svg>
        </div>
        <div className="rounded-md overflow-hidden bg-white/[0.02]">
          <div className="grid grid-cols-12 px-3 py-2 font-mono text-[10px] tracking-wider text-zinc-500">
            <div className="col-span-4">MODÈLE</div>
            <div className="col-span-2 text-right">ACHAT</div>
            <div className="col-span-2 text-right">HOLD (J)</div>
            <div className="col-span-2 text-right">P&amp;L NET</div>
            <div className="col-span-2 text-right">STATUS</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className={"grid grid-cols-12 px-3 py-2.5 font-mono text-[12px] hover:bg-white/[0.02] ease-expo transition-colors relative " + (pulseIdx === i ? "bg-emerald-500/[0.04]" : "")}
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="col-span-4 text-zinc-200">{r.name}</div>
              <div className="col-span-2 text-right text-zinc-400">{r.buy} €</div>
              <div className="col-span-2 text-right text-zinc-400">{r.hold}</div>
              <div className={"col-span-2 text-right font-semibold relative " + (r.profit >= 0 ? "text-emerald-400" : "text-red-400")}
                style={{ transition: "all 400ms cubic-bezier(0.16,1,0.3,1)" }}>
                {r.profit >= 0 ? "+" : ""}{r.profit} €
                {badge && badge.idx === i && (
                  <span className="absolute -right-1 -top-3 font-mono text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300" style={{ animation: "fade-up 300ms ease both" }}>+{badge.val} €</span>
                )}
              </div>
              <div className="col-span-2 text-right">
                <span className={"px-1.5 py-0.5 rounded text-[10px] " + (r.status === "vendu" ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400")}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
        {toast && (
          <div key={toast.k} className="toast-anim absolute top-3 right-3 font-mono text-[10.5px] px-2.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 backdrop-blur-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            1 vente détectée · {toast.txt}
          </div>
        )}
      </div>
    </div>
  );
}