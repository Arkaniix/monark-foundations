import { useEffect, useState } from "react";
import useReducedMotion from "@/lib/useReducedMotion";
import type { EstimatorInputs } from "./datasets";

const LINE_DELAY_MS = 260;

type TermLine = { text: string; tone: "prompt" | "dim" | "ok" | "accent" };

export default function EstimatorTerminal({ inputs }: { inputs?: EstimatorInputs }) {
  const reduced = useReducedMotion();
  const model = inputs?.model ?? "—";
  const itemState = inputs?.state ?? "—";
  const platform = inputs?.platform ?? "—";
  const mode = inputs?.flow === "sell" ? "sell" : "buy";

  const lines: TermLine[] = [
    { text: `monark@estimator:~$ evaluate --mode ${mode} --model "${model}"`, tone: "prompt" },
    { text: `→ état: ${itemState} · plateforme: ${platform}`, tone: "dim" },
    { text: "→ récupération des ventes sold composite (180j)…", tone: "dim" },
    { text: "✓ comparables appariés", tone: "ok" },
    { text: "→ médiane · IQR · trend 14j…", tone: "dim" },
    { text: "→ modificateurs état · liquidité · décote…", tone: "dim" },
    { text: "→ composition du verdict…", tone: "accent" },
  ];

  const [shown, setShown] = useState(reduced ? lines.length : 0);

  useEffect(() => {
    if (reduced) {
      setShown(lines.length);
      return;
    }
    setShown(0);
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      setShown((s) => Math.min(s + 1, lines.length));
      if (count >= lines.length) clearInterval(id);
    }, LINE_DELAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, model, itemState, platform, mode]);

  const toneClass = (tone: TermLine["tone"]) => {
    if (tone === "prompt" || tone === "ok") return "text-emerald-400";
    if (tone === "accent") return "text-blue-400";
    return "text-zinc-500";
  };

  return (
    <div className="mk-card p-6 flex flex-col min-h-[420px]">
      <div className="flex items-center justify-between mb-5">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          estimator — analyse en cours
        </div>
      </div>

      <div className="flex-1 font-mono text-[12.5px] leading-[1.7]">
        {lines.slice(0, shown).map((line, idx) => (
          <div key={idx} className={toneClass(line.tone)}>
            {line.text}
            {idx === shown - 1 && <span className="inline-block w-2 h-[1.1em] ml-1 bg-blue-400/80 align-text-bottom animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { EstimatorTerminal };
