import { useState, useEffect, useCallback } from "react";
import { Check, Lock, Sparkle } from "lucide-react";
import { SectionLabel, Sparkline } from "@/components/ui";
import { LENS_SCENARIOS, type LensScenario, type LensScenarioKey } from "./lens";
import PlatformMockup from "./PlatformMockup";
import type { Scene } from "./scenes";
import KpiTile from "./KpiTile";
import VerdictCrystal from "./VerdictCrystal";

type RevealState = { overlay: boolean; fair: boolean; margin: boolean; liq: boolean; verdict: boolean };

function toScene(s: LensScenario): Scene {
  return {
    key: "lbc",
    platformLabel: "l*boncoin.fr",
    domain: s.domain,
    bg: "from-orange-500/10 to-transparent",
    accent: s.color,
    title: s.title,
    sellerLine: s.sellerLine,
    locDate: s.locDate,
    pictKey: s.pictKey,
    pills: s.pills,
    desc: s.desc,
    cta: s.cta,
    price: s.askPrice,
    verdict: { text: s.label, color: s.color, crystal: s.color },
    fairPrice: s.fair,
    delta: s.delta,
    deltaPos: s.deltaPos,
    margin: s.margin,
    liquidity: s.liquidity,
    comps: s.comps,
    spark: s.spark,
    sparkColor: s.sparkColor,
    modifiers: s.modifiers,
  };
}

export default function LensSection() {
  const [scenario, setScenario] = useState<LensScenarioKey>("foncer");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState<number>(-1);
  const [reveal, setReveal] = useState<RevealState>({ overlay: false, fair: false, margin: false, liq: false, verdict: false });
  const s = LENS_SCENARIOS[scenario];

  const reset = useCallback(() => {
    setPhase("idle");
    setStep(-1);
    setReveal({ overlay: false, fair: false, margin: false, liq: false, verdict: false });
  }, []);

  useEffect(() => { reset(); }, [scenario, reset]);

  const run = useCallback(() => {
    if (phase === "running") return;
    setPhase("running");
    setStep(-1);
    setReveal({ overlay: false, fair: false, margin: false, liq: false, verdict: false });
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setReveal(r => ({ ...r, overlay: true })), 0));
    t.push(setTimeout(() => setStep(0), 600));
    t.push(setTimeout(() => setStep(1), 900));
    t.push(setTimeout(() => setStep(2), 1200));
    t.push(setTimeout(() => setReveal(r => ({ ...r, fair: true })), 1500));
    t.push(setTimeout(() => setReveal(r => ({ ...r, margin: true })), 1580));
    t.push(setTimeout(() => setReveal(r => ({ ...r, liq: true })), 1660));
    t.push(setTimeout(() => { setReveal(r => ({ ...r, verdict: true })); setPhase("done"); }, 2000));
    return () => t.forEach(clearTimeout);
  }, [phase]);

  const crystalColor = phase === "running" ? (step < 1 ? "#EF4444" : step < 2 ? "#F59E0B" : s.color) : s.color;

  return (
    <section id="lens" className="relative py-24 border-t border-white/5">
      <div className="max-w-[1320px] mx-auto px-6">
        <SectionLabel idx={2} label="MONARK LENS · EXTENSION NAVIGATEUR" />
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-[40px] leading-[1.05] font-semibold tracking-tight mb-5">
              Le verdict reseller, sur l'annonce, en moins de 2 secondes.
            </h2>
            <p className="text-[14.5px] text-zinc-400 leading-relaxed mb-7">
              L'extension lit l'annonce que vous regardez, croise les comparables vendus sur les 180 derniers jours, et vous rend une décision exécutable. Pas un score, pas une "tendance" — un verdict.
            </p>
            <ul className="space-y-3.5 mb-8">
              {([
                ["Verdict reseller", "FONCER · NÉGOCIER · TENTER AU CULOT · PASSER. Quatre actions, jamais plus."],
                ["Fair price composite", "Médiane pondérée LBC sold (×1.0) + eBay sold (×0.85), demi-vie 14 jours."],
                ["Marge nette projetée", "Frais plateforme intégrés : LBC 12 %, FB 15 %, Vinted 5 %, eBay 5 %+13 %."],
              ] as [string, string][]).map(([t, b]) => (
                <li key={t} className="flex gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-sm bg-blue-500/15 border border-blue-500/40 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-medium text-zinc-100">{t}</div>
                    <div className="text-[12.5px] text-zinc-500 leading-relaxed">{b}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="font-mono text-[10px] text-zinc-500 tracking-wider mb-2">SCÉNARIO</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.entries(LENS_SCENARIOS) as [LensScenarioKey, LensScenario][]).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setScenario(k)}
                    className={"px-2 py-2 rounded-md font-mono text-[10.5px] tracking-wider border ease-expo transition-all " + (scenario === k ? "border-white/25 bg-white/5 text-zinc-100" : "border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/15")}
                    style={scenario === k ? { boxShadow: `inset 0 0 0 1px ${v.color}55, 0 0 24px -8px ${v.color}88` } : {}}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={run} disabled={phase === "running"} className="btn-shimmer flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white font-medium text-[13px] disabled:opacity-50 ease-expo transition-colors">
                <Sparkle className="w-3.5 h-3.5" /> Simuler analyse
              </button>
              <button onClick={reset} className="px-4 py-2.5 rounded-md border border-white/10 hover:border-white/25 text-zinc-300 text-[13px] ease-expo transition-colors">
                Reset
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="relative rounded-xl border border-white/10 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]" style={{ background: "#0a0a0b" }}>
              <div className="h-9 border-b border-white/5 flex items-center px-3 gap-2" style={{ background: "rgba(24,24,27,0.6)" }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                </div>
                <div className="flex-1 mx-3 h-5 rounded bg-black/50 border border-white/5 flex items-center px-2 gap-1.5">
                  <Lock className="w-2.5 h-2.5 text-zinc-600" />
                  <span className="font-mono text-[10px] text-zinc-500 truncate">{s.domain}</span>
                </div>
              </div>

              <div className="relative min-h-[560px]">
                <PlatformMockup s={toScene(s)} dense={true} />

                <div
                  className="absolute right-5 top-5 w-[320px] rounded-lg backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden ease-expo"
                  style={{
                    background: "rgba(10,10,11,0.95)",
                    transform: reveal.overlay ? "translateX(0) scale(1)" : "translateX(40px) scale(0.96)",
                    opacity: reveal.overlay ? 1 : 0,
                    transition: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div className="px-3.5 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-sm bg-blue-500" />
                      <span className="font-mono text-[10.5px] font-semibold tracking-wider">MONARK · LENS</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></div>
                      <span className="font-mono text-[9.5px] text-zinc-500">ANALYSE</span>
                    </div>
                  </div>
                  <div className="p-4 flex gap-4 items-center">
                    <div className="shrink-0" style={{ filter: `drop-shadow(0 0 20px ${crystalColor}88)` }}>
                      <VerdictCrystal color={crystalColor} size={80} />
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-[9px] text-zinc-500 mb-1 tracking-wider">VERDICT</div>
                      {reveal.verdict ? (
                        <div className={"text-[19px] font-semibold leading-tight " + s.glow} style={{ color: s.color }}>
                          {s.label}
                        </div>
                      ) : (
                        <div className="text-[14px] font-medium text-zinc-600">
                          {phase === "running" ? "calcul…" : "—"}
                        </div>
                      )}
                      <div className="font-mono text-[10px] text-zinc-500 mt-1">conf. {reveal.verdict ? s.confidence : "··"} %</div>
                    </div>
                  </div>

                  <div className="px-4 pb-2 space-y-1 min-h-[58px]">
                    {s.statusLines.map((line, i) => (
                      <div key={i} className="flex items-center gap-1.5 font-mono text-[10px]" style={{ opacity: step >= i ? 1 : 0.18, transition: "opacity 200ms" }}>
                        {step >= i ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <span className="w-2.5 h-2.5 inline-block rounded-full border border-zinc-700"></span>}
                        <span className="text-zinc-500 truncate">{line}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-3.5 pb-2 grid grid-cols-3 gap-2">
                    <KpiTile label="FAIR PRICE" value={s.fair} revealed={reveal.fair} />
                    <KpiTile label="MARGE NETTE" value={s.margin} revealed={reveal.margin} accent="#10B981" />
                    <KpiTile label="LIQUIDITÉ" value={s.liquidity.toFixed(2)} revealed={reveal.liq} bar={s.liquidity} />
                  </div>
                  <div className="px-3.5 pb-2 flex items-center justify-between" style={{ opacity: reveal.liq ? 1 : 0.2, transition: "opacity 300ms" }}>
                    <div className="font-mono text-[9.5px] text-zinc-500">prix médian · 30j</div>
                    <Sparkline points={s.spark} color={s.sparkColor} w={88} h={22} />
                  </div>
                  <div className="px-3.5 pb-2 flex flex-wrap gap-1" style={{ opacity: reveal.verdict ? 1 : 0, transition: "opacity 300ms" }}>
                    {s.modifiers.map(([k, v], i) => {
                      const c = v >= 0 ? "#10B981" : "#EF4444";
                      return (
                        <span key={i} className="font-mono text-[9.5px] px-1.5 py-0.5 rounded-full" style={{ color: c, background: c + "15", border: `1px solid ${c}40` }}>
                          {k} {v >= 0 ? "+" : ""}{v}
                        </span>
                      );
                    })}
                  </div>
                  <div className="px-3.5 pb-3.5 font-mono text-[9.5px] text-zinc-600" style={{ opacity: reveal.verdict ? 1 : 0, transition: "opacity 300ms" }}>{s.comps}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}