import { Search, ArrowRight } from "lucide-react";
import type { Scene } from "./scenes";
import PhotoPlaceholder from "./PhotoPlaceholder";
import MetaPills from "./MetaPills";
import PlatformWordmark from "./PlatformWordmark";

type Props = { s: Scene; dense?: boolean };

export default function LbcMockup({ s, dense = false }: Props) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center justify-between px-3 h-9 border-b border-white/[0.04] bg-white/[0.015]">
        <div className="flex items-center gap-3">
          <PlatformWordmark kind="lbc" size={13} />
          <div className="hidden md:flex items-center h-5 px-2 rounded bg-zinc-900/60 border border-white/[0.04] font-mono text-[9.5px] text-zinc-500 gap-1.5">
            <Search className="w-2.5 h-2.5" /> Rechercher sur l*boncoin
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-500">
          <span>Mes recherches</span>
          <span>Favoris</span>
          <div className="w-4 h-4 rounded-full bg-orange-700/60"></div>
        </div>
      </div>
      <div className="px-3 py-1.5 border-b border-white/[0.03] font-mono text-[9px] text-zinc-600 flex gap-3">
        <span>Immobilier</span><span>Véhicules</span><span className="text-zinc-400">Électronique</span><span>Mode</span><span>Maison</span>
      </div>
      <div className="px-3 py-1.5 font-mono text-[9px] text-zinc-600 truncate">
        Accueil <span className="text-zinc-700">›</span> Ordinateurs <span className="text-zinc-700">›</span> Auvergne-Rhône-Alpes <span className="text-zinc-700">›</span> Rhône <span className="text-zinc-700">›</span> Villeurbanne <span className="text-zinc-700">›</span> <span className="text-zinc-400">{s.title}</span>
      </div>
      <div className="flex-1 grid grid-cols-12 gap-2 p-3 min-h-0">
        <div className="col-span-7 flex flex-col gap-2 min-h-0">
          <div className="grid grid-cols-3 gap-1 flex-1 min-h-0">
            <div className="col-span-2 relative">
              <PhotoPlaceholder pictKey={s.pictKey} thumbVariant={0} />
              <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-zinc-300">Annonces similaires</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex-1 relative"><PhotoPlaceholder pictKey="Box" thumbVariant={1} /></div>
              <div className="flex-1 relative">
                <PhotoPlaceholder pictKey={s.pictKey} thumbVariant={2} />
                <div className="absolute inset-x-0 bottom-1 text-center font-mono text-[9px] text-zinc-300">Voir les photos</div>
              </div>
            </div>
          </div>
          <div className="rounded-md bg-white/[0.02] p-2.5">
            <div className="text-[12.5px] font-semibold leading-tight text-zinc-100">{s.title}</div>
            <div className="font-mono text-[20px] font-semibold text-zinc-100 mt-1.5 leading-none">{s.price}</div>
            <div className="mt-1 text-[9.5px] text-zinc-500">{s.locDate}</div>
            <MetaPills items={s.pills.slice(0, 4)} />
          </div>
        </div>
        <div className="col-span-5 rounded-md bg-white/[0.02] p-2.5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-700/40 flex items-center justify-center font-mono text-[11px] text-orange-200 font-semibold">{s.sellerLine[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-zinc-200 font-medium truncate">{s.sellerLine.split("·")[0].trim()}</div>
              <div className="font-mono text-[9px] text-zinc-500">★ 5 (1) · 2 annonces</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[8.5px] px-1.5 py-0.5 rounded bg-orange-700/15 text-orange-300 border border-orange-700/30">⚡ Réactif</span>
          </div>
          <div className="font-mono text-[9px] text-zinc-500">Dernière activité il y a 8 heures</div>
          <div className="space-y-1.5 mt-1">
            <div className="text-center py-1.5 rounded text-[11px] font-medium text-orange-100" style={{ background: "rgba(194,65,12,0.65)" }}>Réserver</div>
            <div className="text-center py-1.5 rounded border border-orange-700/40 text-[11px] text-orange-200">Faire une offre</div>
            <div className="text-center py-1.5 rounded text-[11px] text-blue-100" style={{ background: "rgba(30,58,138,0.6)" }}>Contacter</div>
          </div>
          {dense && <div className="mt-1 text-[10px] text-zinc-500 leading-relaxed line-clamp-3">{s.desc}</div>}
        </div>
      </div>
    </div>
  );
}