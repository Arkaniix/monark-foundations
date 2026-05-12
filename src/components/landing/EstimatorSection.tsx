import { useState, useMemo } from "react";
import { BarChart3 as Bars } from "lucide-react";
import { SectionLabel, Pill, Field, ScoreBar, ConfidenceGauge } from "@/components/ui";
import { VerdictCrystal } from "@/components/ui";
import { PercentileChart } from "@/components/ui";
import { MODELS, STATES, PLATFORMS, FEES, computeVerdict, type Platform, type ItemState, type EstimatorResult } from "./estimator";

export default function EstimatorSection() {
  const [model, setModel] = useState<string>("AMD Ryzen 7 7800X3D");
  const [state, setState] = useState<ItemState>("Bon");
  const [askPrice, setAskPrice] = useState<number>(265);
  const [platform, setPlatform] = useState<Platform>("LBC");
  const [phase, setPhase] = useState<"idle" | "calc" | "done">("idle");
  const [step, setStep] = useState<number>(-1);
  const [result, setResult] = useState<EstimatorResult | null>(null);

  const run = () => {
    setPhase("calc");
    setStep(-1);
    const computed = computeVerdict({ model, state, askPrice, platform });
    setResult(computed);
    const lines = 5;
    let i = 0;
    const tick = () => {
      i++;
      setStep(i);
      if (i < lines) setTimeout(tick, 200);
      else setTimeout(() => setPhase("done"), 200);
    };
    setTimeout(tick, 200);
  };

  const r = result;
  const statusLines = useMemo(() => r ? [
    `> Fetching ${platform} sold (180j)... ✓ 412 obs`,
    `> Composite median (LBC + eBay×0.85)... ✓ ${r.p50} €`,
    `> Liquidity score... ✓ ${r.liq.toFixed(2)}`,
    `> Trend modifier (14j)... ✓ ${r.trend >= 0 ? "+" : ""}${r.trend}`,
    `> Computing verdict...`,
  ] : [], [r, platform]);

  return (
    <section id="estimator" className="relative py-24 border-t border-white/5">
      <div className="max-w-[1320px] mx-auto px-6">
        <SectionLabel idx={3} label="ESTIMATOR · MOTEUR DE SCORING" />
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <h2 className="text-[40px] leading-[1.05] font-semibold tracking-tight max-w-2xl">
            Composite 40 / 35 / 25.<br />
            <span className="text-zinc-500">Marge nette. Liquidité. Affinité catégorie-plateforme.</span>
          </h2>
          <div className="font-mono text-[12px] text-zinc-500">Tier complete · 3 crédits par estimation</div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="mk-card-flat-soft lg:col-span-5 p-6">
            <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-5">INPUT</div>
            <div className="space-y-5">
              <Field label="Modèle">
                <select value={model} onChange={e => setModel(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2.5 text-[13.5px] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors">
                  {MODELS.map(m => <option key={m} value={m} className="bg-zinc-950">{m}</option>)}
                </select>
              </Field>
              <Field label="État">
                <div className="grid grid-cols-5 gap-1.5">
                  {STATES.map(s => (
                    <button key={s} onClick={() => setState(s)}
                      className={"py-2 rounded text-[11px] border ease-expo transition-all " + (state === s ? "border-white/30 bg-white/10 text-zinc-100" : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/15")}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Prix demandé (€)">
                <input type="number" value={askPrice} onChange={e => setAskPrice(parseFloat(e.target.value) || 0)}
                  className="font-mono w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors" />
              </Field>
              <Field label="Plateforme">
                <div className="grid grid-cols-4 gap-1.5">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setPlatform(p)}
                      className={"py-2 rounded font-mono text-[11px] border ease-expo transition-all " + (platform === p ? "border-white/30 bg-white/10 text-zinc-100" : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/15")}>
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
              <button onClick={run} disabled={phase === "calc"} className="btn-shimmer w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-blue-500 hover:bg-blue-400 text-white font-medium text-[13.5px] disabled:opacity-50 ease-expo transition-colors shadow-[0_8px_30px_-8px_rgba(59,130,246,0.6)]">
                <Bars className="w-4 h-4" /> Évaluer · 3 crédits
              </button>
              <div className="font-mono text-[10px] text-zinc-600 text-center">
                Frais plateforme appliqués : {FEES[platform]} %
              </div>
            </div>
          </div>

          <div className="mk-card-flat-soft lg:col-span-7 p-6 min-h-[640px]">
            <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-5 flex items-center justify-between">
              <span>OUTPUT</span>
              <span>{phase === "idle" ? "en attente" : phase === "calc" ? "calcul…" : "verdict prêt"}</span>
            </div>

            {phase === "idle" && (
              <div className="h-[560px] flex flex-col items-center justify-center text-center">
                <div className="opacity-30 mb-4"><VerdictCrystal color="#52525B" size={100} /></div>
                <div className="text-[14px] text-zinc-500 max-w-xs">Cliquez « Évaluer » pour lancer le scoring composite. Au moins trois combinaisons d'inputs produisent des verdicts différents.</div>
              </div>
            )}

            {phase !== "idle" && r && (
              <div>
                <div className="mb-5 rounded-md bg-black/50 p-3 font-mono text-[11.5px] space-y-1">
                  {statusLines.map((line, i) => (
                    <div key={i} className="flex" style={{ opacity: step > i ? 1 : step === i ? 0.6 : 0.18, transition: "opacity 200ms" }}>
                      <span className="text-zinc-600 w-5">{step > i ? "✓" : step === i ? "·" : " "}</span>
                      <span className={step > i ? "text-zinc-300" : "text-zinc-500"}>{line}</span>
                    </div>
                  ))}
                </div>

                {phase === "done" && (
                  <div className="space-y-4 fade-up">
                    <PercentileChart distribution={{ p10: r.p10, p25: r.p25, p50: r.p50, p75: r.p75, p90: r.p90 }} askPrice={askPrice} color={r.color} observationsLabel="412 obs" />

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-7 mk-subcard-soft p-4 space-y-3">
                        <div className="font-mono text-[10px] tracking-wider text-zinc-500">SCORE COMPOSITE</div>
                        <ScoreBar label="Marge nette" weight="40 %" value={r.composite.margin} color="#10B981" />
                        <ScoreBar label="Liquidité" weight="35 %" value={r.composite.liquidity} color="#3B82F6" />
                        <ScoreBar label="Affinité cat./plat." weight="25 %" value={r.composite.affinity} color="#8B5CF6" />
                        <div className="h-px bg-white/[0.04] my-2" />
                        <div className="flex flex-wrap gap-1.5">
                          <Pill label={`Trend ${r.trend >= 0 ? "+" : ""}${r.trend}`} color={r.trend >= 0 ? "#10B981" : "#EF4444"} />
                          <Pill label={`Liquidité ${r.liqMod >= 0 ? "+" : ""}${r.liqMod}`} color={r.liqMod >= 0 ? "#10B981" : "#EF4444"} />
                          <Pill label={`Value-vs-new ${r.valueVsNew >= 0 ? "+" : ""}${r.valueVsNew}`} color={r.valueVsNew >= 0 ? "#10B981" : "#EF4444"} />
                        </div>
                      </div>
                      <div className="col-span-5 mk-subcard-soft p-5 flex flex-col items-center justify-center text-center">
                        <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-2">VERDICT</div>
                        <div className="mb-1"><VerdictCrystal color={r.color} size={90} /></div>
                        <div className={"text-[20px] font-semibold tracking-tight mt-1 " + r.glow} style={{ color: r.color }}>{r.verdict}</div>
                        <ConfidenceGauge value={r.confidence} color={r.color} />
                        <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1 w-full">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="font-mono text-[9px] tracking-wider text-zinc-500">FAIR PRICE</div>
                            <div className="font-mono text-[14px] text-zinc-100">{r.p50} €</div>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="font-mono text-[9px] tracking-wider text-zinc-500">MARGE NETTE</div>
                            <div className="font-mono text-[14px]" style={{ color: r.netMargin >= 0 ? "#10B981" : "#EF4444" }}>{r.netMargin >= 0 ? "+" : ""}{r.netMargin} €</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}