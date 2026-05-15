import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Counter } from "@/components/ui";
import MockupBrowser from "@/components/landing/MockupBrowser";
import { HERO_SCENES } from "@/components/landing/scenes";
import PlatformMockup from "@/components/landing/PlatformMockup";
import LensHeroOverlay from "./LensHeroOverlay";

export default function Hero() {
  const [sceneIdx, setSceneIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSceneIdx((i) => (i + 1) % HERO_SCENES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-3xl"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-3xl"></div>
      </div>
      <div className="relative max-w-[1320px] mx-auto px-6 pt-20 pb-12 grid grid-cols-12 gap-10 items-center">
        <div className="col-span-12 lg:col-span-5">
          <div className="fade-up inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></div>
            <span className="font-mono text-[10.5px] tracking-wider text-zinc-400">MARKET DATA · MISE À JOUR EN CONTINU</span>
          </div>
          <h1 className="fade-up text-[54px] leading-[1.02] font-semibold tracking-tight text-zinc-50" style={{ animationDelay: "0ms" }}>
            Le bon prix,<br/>le bon deal,<br/>la bonne plateforme.<br/>
            <span className="text-zinc-500">En 3 secondes.</span>
          </h1>
          <p className="fade-up mt-5 text-[16px] leading-relaxed text-zinc-400 max-w-md" style={{ animationDelay: "150ms" }}>
            Extension navigateur et moteur d'estimation pour le hardware PC d'occasion. Lit Leboncoin, Vinted, eBay et Facebook Marketplace en temps réel — vous donne un verdict reseller, un fair price, une marge nette.
          </p>
          <div className="fade-up mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
            <a href="#install" className="btn-shimmer inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white font-medium text-[13.5px] shadow-[0_8px_30px_-8px_rgba(59,130,246,0.6)] ease-expo transition-all">
              Installer Monark Lens <ArrowRight className="w-4 h-4"/>
            </a>
            <a href="#estimator" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-white/10 hover:border-white/25 hover:bg-white/[0.03] text-zinc-200 font-medium text-[13.5px] ease-expo transition-all">
              Voir l'estimator en live
            </a>
          </div>
          <div className="fade-up mt-9 grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden" style={{ animationDelay: "450ms" }}>
            <div className="bg-[#0A0A0B] p-4">
              <div className="font-mono text-[10px] text-zinc-500 tracking-wider mb-1">MODÈLES TRACKÉS</div>
              <div className="text-[22px] font-semibold"><Counter value={660} suffix="+"/></div>
            </div>
            <div className="bg-[#0A0A0B] p-4">
              <div className="font-mono text-[10px] text-zinc-500 tracking-wider mb-1">OBSERVATIONS PRIX</div>
              <div className="text-[22px] font-semibold"><Counter value={46211}/></div>
            </div>
            <div className="bg-[#0A0A0B] p-4">
              <div className="font-mono text-[10px] text-zinc-500 tracking-wider mb-1">PLATEFORMES</div>
              <div className="text-[22px] font-semibold font-mono"><Counter value={4}/></div>
            </div>
            <div className="bg-[#0A0A0B] p-4">
              <div className="font-mono text-[10px] text-zinc-500 tracking-wider mb-1">LATENCE DATA</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></div>
                <div className="font-mono text-[14px] font-semibold text-zinc-200">temps réel</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-7 fade-up" style={{ animationDelay: "200ms" }}>
          <MockupBrowser
            domain={HERO_SCENES[sceneIdx].domain}
            platformLabel={HERO_SCENES[sceneIdx].platformLabel}
            progressCount={HERO_SCENES.length}
            progressActiveIdx={sceneIdx}
          >
            {HERO_SCENES.map((sc, i) => (
              <div
                key={sc.key}
                className="absolute inset-0 transition-opacity"
                style={{ opacity: i === sceneIdx ? 1 : 0, transitionDuration: "1000ms", transitionTimingFunction: "linear" }}
              >
                <div className={"absolute inset-0 bg-gradient-to-br " + sc.bg + " pointer-events-none"} />
                <div className="relative h-full overflow-hidden">
                  <PlatformMockup s={sc} />
                </div>
              </div>
            ))}
            <LensHeroOverlay scene={HERO_SCENES[sceneIdx]} />
          </MockupBrowser>
        </div>
      </div>
    </section>
  );
}