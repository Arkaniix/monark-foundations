import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Zap, Cpu } from "lucide-react";

type Line = { id: number; text: string; typed: string; caret: boolean };

export default function RepairGuideCard() {
  const [lines, setLines] = useState<Line[]>([]);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const idCounter = useRef(0);
  const symptoms: { ic: React.ComponentType<{ className?: string }>; t: string; d: string }[] = [
    { ic: AlertTriangle, t: "Artefacts en jeu", d: "VRAM ou drivers — checklist d'isolation." },
    { ic: Zap, t: "Coupures sous charge", d: "PSU, ATX 12VHPWR, ondulations rail." },
    { ic: Cpu, t: "Pas de POST", d: "MEM/VGA/CPU/BOOT, codes Q-LED, BIOS." },
  ];

  useEffect(() => {
    let stop = false;
    const initialTarget = "Diagnostic en cours · pattern : artefacts mémoire VRAM · MOSFET phase 4 · refit thermique recommandé.";
    const cyclePool = [
      "> Lecture température die... 81°C (haute charge) · OK",
      "> Test ECC mémoire VRAM... 0 erreur sur 24 cycles",
      "> Pattern artefacts détecté · phase 4 MOSFET suspect",
      "> Recommandation : refit thermique pads 1.5mm",
      "> Confiance diagnostic : 87 %",
      "> Scan rails 12V/5V/3.3V... ondulations < 50 mV",
      "> Stress test FurMark 10min... stable, throttle absent",
    ];
    const id = ++idCounter.current;
    setLines([{ id, text: initialTarget, typed: "", caret: true }]);
    let i = 0;
    let cycleIdx = 0;
    const scheduleNext = () => {
      if (stop) return;
      const text = cyclePool[cycleIdx % cyclePool.length];
      cycleIdx++;
      const newId = ++idCounter.current;
      setLines(ls => {
        const next = [...ls.map(l => ({ ...l, caret: false })), { id: newId, text, typed: "", caret: true }];
        return next.length > 5 ? next.slice(next.length - 5) : next;
      });
      let j = 0;
      const t2 = () => {
        if (stop) return;
        j++;
        setLines(ls => ls.map(l => l.id === newId ? { ...l, typed: text.slice(0, j) } : l));
        if (j < text.length) setTimeout(t2, 28 + Math.random() * 22);
        else setTimeout(scheduleNext, 4000);
      };
      setTimeout(t2, 200);
    };
    const tick = () => {
      if (stop) return;
      i++;
      setLines(ls => ls.map(l => l.id === id ? { ...l, typed: initialTarget.slice(0, i) } : l));
      if (i < initialTarget.length) setTimeout(tick, 22 + Math.random() * 30);
      else setTimeout(scheduleNext, 800);
    };
    setTimeout(tick, 600);
    return () => { stop = true; };
  }, []);

  return (
    <div className="mk-card p-6">
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-1">REPAIR GUIDE</div>
            <div className="text-[18px] font-semibold tracking-tight">Deep diagnostic · 5 crédits</div>
          </div>
          <div className="font-mono text-[10px] text-zinc-500">cache 30 j</div>
        </div>
        <div className="space-y-2 mb-4">
          {symptoms.map((it, i) => {
            const Icon = it.ic;
            const active = hoverIdx === i;
            return (
              <div key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className="flex gap-3 p-3 rounded-md ease-expo transition-colors"
                style={{ background: active ? "rgba(59,130,246,0.04)" : "rgba(255,255,255,0.02)" }}>
                <div className="text-zinc-400 mt-0.5">
                  <Icon className={"w-4 h-4 " + (active ? "pulse-soft" : "")} />
                </div>
                <div>
                  <div className="text-[13px] font-medium">{it.t}</div>
                  <div className="text-[12px] text-zinc-500">{it.d}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-md bg-black/40 p-3 font-mono text-[11.5px] overflow-hidden" style={{ minHeight: 132 }}>
          <div className="text-zinc-600 mb-1">$ monark diag --deep --gpu=rtx3090 --logs</div>
          <div className="space-y-0.5">
            {lines.map((l, i) => {
              const isLast = i === lines.length - 1;
              const fade = lines.length > 4 && i === 0 ? 0.4 : (lines.length > 3 && i === 0 ? 0.6 : 1);
              return (
                <div key={l.id} className="text-zinc-300 leading-relaxed" style={{ opacity: fade, transition: "opacity 400ms ease" }}>
                  {l.typed}{isLast && l.caret && <span className="caret"></span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}