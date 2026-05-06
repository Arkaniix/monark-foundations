import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui";

export default function FinalCtaSection() {
  return (
    <section className="relative py-28 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/[0.08] blur-3xl rounded-full" />
      </div>
      <div className="relative max-w-[900px] mx-auto px-6 text-center">
        <SectionLabel idx={7} label="DERNIER MOT" />
        <h2 className="text-[56px] leading-[1.02] font-semibold tracking-tight mb-6">
          Le marché bouge.<br /><span className="text-zinc-500">Vous aussi.</span>
        </h2>
        <p className="text-[15px] text-zinc-400 max-w-lg mx-auto mb-9 leading-relaxed">
          Installez Lens. Ouvrez une annonce. Décidez. Le reste, c'est juste du temps qui passe.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="#" className="btn-shimmer inline-flex items-center gap-2 px-5 py-3 rounded-md bg-blue-500 hover:bg-blue-400 text-white font-medium text-[14px] shadow-[0_12px_40px_-10px_rgba(59,130,246,0.7)] ease-expo transition-colors">
            Installer Monark Lens <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#estimator" className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-white/10 hover:border-white/25 text-zinc-200 text-[14px] ease-expo transition-colors">
            Tester l'estimator
          </a>
        </div>
      </div>
    </section>
  );
}