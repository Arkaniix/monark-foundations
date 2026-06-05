import { useEffect, useState } from "react";
import useReducedMotion from "@/lib/useReducedMotion";
import type { EstimatorInputs } from "./datasets";

const CHARS_PER_TICK = 2;
const TICK_MS = 18;

type Tone = "prompt" | "dim" | "ok" | "accent";

export default function EstimatorTerminal({ inputs }: { inputs?: EstimatorInputs }) {
  const reduced = useReducedMotion();
  const model = inputs?.model ?? "—";
  const itemState = inputs?.state ?? "—";
  const platform = inputs?.platform ?? "—";
  const mode = inputs?.flow === "sell" ? "sell" : "buy";

  const script: { text: string; tone: Tone }[] = [
    { text: `$ monark estimate --mode ${mode}`, tone: "prompt" },
    { text: `  ↳ ${model} · ${itemState} · ${platform}`, tone: "dim" },
    { text: "fetch sold composite · 180 j …", tone: "dim" },
    { text: "✓ comparables appariés", tone: "ok" },
    { text: "compute médiane · IQR · trend 14 j …", tone: "dim" },
    { text: "score → composition du verdict …", tone: "accent" },
  ];

  const total = script.reduce((n, l) => n + l.text.length, 0);
  const [typed, setTyped] = useState(reduced ? total : 0);

  useEffect(() => {
    if (reduced) {
      setTyped(total);
      return;
    }
    setTyped(0);
    const id = setInterval(() => {
      setTyped((t) => {
        const next = t + CHARS_PER_TICK;
        if (next >= total) {
          clearInterval(id);
          return total;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, model, itemState, platform, mode]);

  const starts: number[] = [];
  let acc = 0;
  for (const l of script) {
    starts.push(acc);
    acc += l.text.length;
  }
  const doneTyping = typed >= total;
  let cursorIdx = -1;
  for (let i = 0; i < script.length; i++) {
    if (typed > starts[i]) cursorIdx = i;
  }
  if (doneTyping) cursorIdx = script.length - 1;

  const toneClass = (tone: Tone) =>
    tone === "prompt" || tone === "ok"
      ? "text-emerald-400"
      : tone === "accent"
        ? "text-blue-400"
        : "text-zinc-500";

  return (
    <div className="mk-card p-0 overflow-hidden min-h-[420px] flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" aria-hidden="true" />
        <span className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          ESTIMATOR · ANALYSE
        </span>
      </div>
      <div className="flex-1 p-5 font-mono text-[12.5px] leading-relaxed">
        {script.map((l, idx) => {
          if (idx > cursorIdx) return null;
          const visible = Math.min(l.text.length, Math.max(0, typed - starts[idx]));
          return (
            <div key={idx} className={toneClass(l.tone)}>
              <span>{l.text.slice(0, visible)}</span>
              {idx === cursorIdx && <span className="caret" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { EstimatorTerminal };
