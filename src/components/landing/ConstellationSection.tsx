import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/ui";

type Cat = { name: string; color: string; cx: number; cy: number; n: number };
type Node = { x: number; y: number; color: string; phase: number; size: number; drift: number; driftY: number };

export default function ConstellationSection() {
  const cvsRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const onScroll = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      setScrollY((window.innerHeight / 2 - rect.top) * 0.18);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const cvs = cvsRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = cvs.clientWidth, h = cvs.clientHeight;
      cvs.width = w * dpr; cvs.height = h * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const W = () => cvs.width / dpr;
    const H = () => cvs.height / dpr;

    const cats: Cat[] = [
      { name: "GPU", color: "#3B82F6", cx: 0.18, cy: 0.36, n: 130 },
      { name: "CPU", color: "#10B981", cx: 0.42, cy: 0.62, n: 90 },
      { name: "RAM", color: "#F59E0B", cx: 0.58, cy: 0.30, n: 70 },
      { name: "SSD", color: "#8B5CF6", cx: 0.74, cy: 0.55, n: 70 },
      { name: "MOBO", color: "#EF4444", cx: 0.30, cy: 0.78, n: 80 },
      { name: "PSU", color: "#A1A1AA", cx: 0.85, cy: 0.30, n: 60 },
    ];
    const nodes: Node[] = [];
    cats.forEach((c) => {
      for (let i = 0; i < c.n; i++) {
        const r = Math.pow(Math.random(), 0.7) * 0.18;
        const a = Math.random() * Math.PI * 2;
        nodes.push({
          x: c.cx + Math.cos(a) * r,
          y: c.cy + Math.sin(a) * r,
          color: c.color,
          phase: Math.random() * Math.PI * 2,
          size: 0.7 + Math.random() * 1.2,
          drift: (Math.random() - 0.5) * 0.0003,
          driftY: (Math.random() - 0.5) * 0.0003,
        });
      }
    });

    let raf = 0;
    const draw = (t: number) => {
      const w = W(), h = H();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "rgba(255,255,255,0.018)";
      for (let i = 0; i < w; i += 28) {
        for (let j = 0; j < h; j += 28) {
          ctx.fillRect(i, j, 1, 1);
        }
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < Math.min(nodes.length, i + 14); j++) {
          const b = nodes[j];
          const dx = (a.x - b.x), dy = (a.y - b.y);
          const d2 = dx * dx + dy * dy;
          if (d2 < 0.0035 && a.color === b.color) {
            const op = Math.max(0, 0.18 - d2 * 40);
            ctx.strokeStyle = a.color + Math.round(op * 255).toString(16).padStart(2, "0");
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        n.x += n.drift; n.y += n.driftY;
        if (n.x < 0 || n.x > 1) n.drift *= -1;
        if (n.y < 0 || n.y > 1) n.driftY *= -1;
        const pulse = 0.6 + 0.4 * (Math.sin(t / 1000 + n.phase) * 0.5 + 0.5);
        ctx.fillStyle = n.color + Math.round(pulse * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, n.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section className="relative py-24 border-t border-white/5 overflow-hidden">
      <div ref={wrapRef} className="max-w-[1320px] mx-auto px-6 relative">
        <SectionLabel idx={5} label="UNIVERS DE DONNÉES" />
        <div className="relative const-mask" style={{ height: 520 }}>
          <canvas ref={cvsRef} className="absolute inset-0 w-full h-full" style={{ transform: `translateY(${scrollY * -1}px)`, padding: 40 }} />

          <div className="absolute top-4 left-4 flex flex-col gap-1 font-mono text-[10px]">
            {([
              ["GPU", "#3B82F6"], ["CPU", "#10B981"], ["RAM", "#F59E0B"],
              ["SSD", "#8B5CF6"], ["MOBO", "#EF4444"], ["PSU", "#A1A1AA"],
            ] as [string, string][]).map(([n, c]) => (
              <div key={n} className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                <span>{n}</span>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6">
              <div className="font-mono text-[11px] text-zinc-500 tracking-[0.25em] mb-3">RÉSEAU DE PRIX</div>
              <div className="text-[28px] md:text-[34px] font-semibold tracking-tight leading-tight">
                <span className="font-mono text-zinc-100">660</span> modèles. <span className="font-mono text-zinc-100">46 211</span> observations.
                <br />
                <span className="font-mono text-zinc-100">4</span> plateformes. <span className="text-zinc-500">Une seule vue.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}