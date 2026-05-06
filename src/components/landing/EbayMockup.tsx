import { Search, Heart, Zap, Eye } from "lucide-react";
import type { Scene } from "./scenes";
import PhotoPlaceholder from "./PhotoPlaceholder";
import PlatformWordmark from "./PlatformWordmark";

type Props = { s: Scene; dense?: boolean };

export default function EbayMockup({ s, dense = false }: Props) {
  const thumbs = [s.pictKey, "Box", "CPU", "Zap", "Layers", "HDD"];
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center justify-between px-3 h-9 border-b border-white/[0.04] bg-white/[0.015]">
        <div className="flex items-center gap-3">
          <PlatformWordmark kind="ebay" size={14} />
          <span className="font-mono text-[9px] text-zinc-500">Explorer par catégorie</span>
          <div className="hidden md:flex items-center h-5 px-2 rounded bg-zinc-900/60 border border-white/[0.04] font-mono text-[9.5px] text-zinc-500 gap-1.5 w-40">
            <Search className="w-2.5 h-2.5" /> Rechercher sur *bay
          </div>
        </div>
        <div className="px-2 py-0.5 rounded border border-blue-500/40 font-mono text-[9.5px] text-blue-300">Rechercher</div>
      </div>
      <div className="px-3 py-1.5 border-b border-white/[0.03] font-mono text-[9px] text-zinc-600 flex justify-between">
        <span>Bonjour ! <span className="text-blue-400">Connectez-vous</span> ou <span className="text-blue-400">inscrivez-vous</span></span>
        <div className="flex gap-3"><span>Vendre</span><span>Mon eBay</span></div>
      </div>
      <div className="flex-1 grid grid-cols-12 gap-2 p-3 min-h-0">
        <div className="col-span-1 flex flex-col gap-1 min-h-0">
          {thumbs.slice(0, 6).map((k, i) => (
            <div key={i} className={"flex-1 relative " + (i === 0 ? "ring-1 ring-blue-500/50 rounded" : "")}>
              <PhotoPlaceholder pictKey={k} thumbVariant={i % 4} />
              {i === 0 && <div className="absolute -top-1 left-0 font-mono text-[8px] px-1 py-0.5 rounded text-red-200 font-semibold" style={{ background: "rgba(127,29,29,0.7)" }}>DANS 2 PANIERS</div>}
            </div>
          ))}
        </div>
        <div className="col-span-6 relative min-h-0">
          <PhotoPlaceholder pictKey={s.pictKey} thumbVariant={0} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 pointer-events-none">
            <div className="w-6 h-6 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-300 text-[10px]">‹</div>
            <div className="w-6 h-6 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-300 text-[10px]">›</div>
          </div>
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-zinc-300">
            <Heart className="w-2.5 h-2.5" /> 5
          </div>
        </div>
        <div className="col-span-5 flex flex-col gap-2 min-h-0">
          <div className="text-[12.5px] font-semibold leading-tight text-zinc-100">{s.title}</div>
          <div className="rounded bg-white/[0.02] p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-700/50 flex items-center justify-center font-mono text-[10px] text-teal-100 font-semibold">{s.sellerLine[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] text-zinc-200 truncate">{s.sellerLine.split("·")[0].trim()} <span className="text-zinc-500">(52)</span> · Particulier ⓘ</div>
              <div className="font-mono text-[9px] text-blue-400">100% d'évaluations positives · <span className="underline">Autres objets</span></div>
              <div className="font-mono text-[9px] text-blue-400 underline">Envoyer un message au vendeur</div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[22px] font-semibold text-zinc-100 leading-none">{s.price}</div>
            {s.priceShipping && <div className="font-mono text-[9px] text-blue-400 mt-1 underline">3 paiements sans intérêts de 100,00 EUR avec Klarna</div>}
          </div>
          <div className="font-mono text-[9.5px] text-zinc-500 flex items-center gap-1.5">
            <span>État :</span><span className="text-zinc-300">Reconditionné par le vendeur</span><Eye className="w-2.5 h-2.5" />
          </div>
          <div className="space-y-1.5">
            <div className="text-center py-1.5 rounded text-[11px] font-medium text-white" style={{ background: "#2563eb" }}>Achat immédiat</div>
            <div className="text-center py-1.5 rounded border text-[11px] text-blue-300" style={{ borderColor: "#2563eb" }}>Ajouter au panier</div>
            <div className="text-center py-1.5 rounded border text-[11px] text-blue-300 flex items-center justify-center gap-1.5" style={{ borderColor: "#2563eb" }}><Heart className="w-3 h-3" /> Suivre cet objet</div>
          </div>
          <div className="rounded p-2 flex items-start gap-1.5 mt-auto" style={{ background: "rgba(127,29,29,0.18)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <Zap className="w-3 h-3 text-red-300 mt-0.5" />
            <div className="text-[9.5px] text-red-200 leading-tight">Plusieurs personnes ont consulté cet objet · 5 personnes l'ont suivi.</div>
          </div>
          {dense && <div className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{s.desc}</div>}
        </div>
      </div>
    </div>
  );
}