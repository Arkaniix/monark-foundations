import { Search, Heart, Zap } from "lucide-react";
import type { Scene } from "./scenes";
import PhotoPlaceholder from "./PhotoPlaceholder";
import PlatformWordmark from "./PlatformWordmark";

type Props = { s: Scene; dense?: boolean };

export default function VintedMockup({ s, dense = false }: Props) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center justify-between px-3 h-9 border-b border-white/[0.04] bg-white/[0.015]">
        <div className="flex items-center gap-3">
          <PlatformWordmark kind="vinted" size={13} />
          <div className="hidden md:flex items-center h-5 px-2 rounded bg-zinc-900/60 border border-white/[0.04] font-mono text-[9.5px] text-zinc-500 gap-1.5">
            <Search className="w-2.5 h-2.5" /> Rechercher des articles
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-500">
          <div className="w-4 h-4 rounded-full bg-teal-800/60"></div>
          <span className="px-1.5 py-0.5 rounded text-[9px] text-teal-100" style={{ background: "rgba(15,118,110,0.7)" }}>Vends tes articles</span>
        </div>
      </div>
      <div className="px-3 py-1.5 border-b border-white/[0.03] font-mono text-[9px] text-zinc-600 flex gap-3">
        <span>Femmes</span><span>Hommes</span><span className="text-zinc-400">Électronique</span><span>Maison</span><span>Loisirs</span>
      </div>
      <div className="flex-1 grid grid-cols-12 gap-2 p-3 min-h-0">
        <div className="col-span-7 grid grid-cols-2 grid-rows-2 gap-1 min-h-0">
          <div className="row-span-2 relative">
            <PhotoPlaceholder pictKey={s.pictKey} thumbVariant={0} />
          </div>
          <div className="relative"><PhotoPlaceholder pictKey="Box" thumbVariant={1} /></div>
          <div className="relative">
            <PhotoPlaceholder pictKey={s.pictKey} thumbVariant={2} />
            <div className="absolute bottom-1 right-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 flex items-center gap-1">
              <Heart className="w-2.5 h-2.5" /> 20
            </div>
          </div>
        </div>
        <div className="col-span-5 flex flex-col gap-2">
          <div>
            <div className="text-[12.5px] font-semibold leading-tight text-zinc-100">{s.title}</div>
            <div className="font-mono text-[10px] text-zinc-500 mt-0.5">Bon état · {s.pills[0] || "—"}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-zinc-600 line-through">{(parseFloat(s.price) * 1.08).toFixed(0)} €</div>
            <div className="font-mono text-[20px] font-semibold text-zinc-100 leading-none">{s.price}</div>
            <div className="font-mono text-[9px] text-teal-400 mt-0.5">Inclut la Protection acheteurs ⓘ</div>
          </div>
          <div className="rounded p-2 flex items-start gap-2" style={{ background: "rgba(127,29,29,0.25)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <Zap className="w-3 h-3 text-red-300 mt-0.5" />
            <div className="text-[10px] text-red-200 leading-tight">En demande ! 4 acheteurs ont envoyé une offre récemment.</div>
          </div>
          <div className="rounded bg-white/[0.02] p-2 font-mono text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-zinc-500">Marque</span><span className="text-zinc-300">AMD</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">État</span><span className="text-zinc-300">Bon état</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Ajouté</span><span className="text-zinc-300">il y a 2h</span></div>
          </div>
          <div className="font-mono text-[9.5px] text-zinc-500">Envoi <span className="text-zinc-300">à partir de 3,28 €</span></div>
          <div className="space-y-1.5 mt-auto">
            <div className="text-center py-1.5 rounded text-[11px] font-medium text-teal-100" style={{ background: "rgba(15,118,110,0.7)" }}>Acheter</div>
            <div className="text-center py-1.5 rounded border border-teal-700/40 text-[11px] text-teal-200">Faire une offre</div>
            <div className="text-center py-1.5 rounded border border-white/[0.06] text-[11px] text-zinc-300">Message</div>
          </div>
          {dense && <div className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{s.desc}</div>}
        </div>
      </div>
    </div>
  );
}