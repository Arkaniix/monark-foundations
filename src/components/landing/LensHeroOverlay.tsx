import { VerdictCrystal } from "@/components/ui";
import { Sparkline } from "@/components/ui";
import type { Scene } from "./scenes";

type Props = { scene: Scene };

export default function LensHeroOverlay({ scene }: Props) {
  return (
    <div
      className="absolute right-4 top-[52px] w-[268px] rounded-lg backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden"
      style={{ background: "rgba(10,10,11,0.95)" }}
    >
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M7 1 L13 7 L7 13 L1 7 Z" fill="#3B82F6" />
          </svg>
          <span className="font-mono text-[10px] font-semibold tracking-wider text-zinc-200">MONARK · LENS</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></div>
          <span className="font-mono text-[9px] text-zinc-500">LIVE</span>
        </div>
      </div>
      <div className="p-3 flex gap-3 items-center">
        <div className="shrink-0">
          <VerdictCrystal color={scene.verdict.crystal} size={60} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] text-zinc-500 mb-0.5 tracking-wider">VERDICT</div>
          <div
            className="text-[14.5px] font-semibold leading-tight"
            style={{ color: scene.verdict.color, textShadow: `0 0 16px ${scene.verdict.color}66` }}
          >
            {scene.verdict.text}
          </div>
          <div className="font-mono text-[10px] mt-0.5" style={{ color: scene.deltaPos ? "#10B981" : "#EF4444" }}>
            {scene.delta}
          </div>
        </div>
      </div>
      <div className="px-3 pb-2 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded bg-white/[0.03] p-1.5">
          <div className="font-mono text-[8.5px] text-zinc-500 mb-0.5">FAIR</div>
          <div className="font-mono text-[11px] font-semibold text-zinc-100">{scene.fairPrice}</div>
        </div>
        <div className="rounded bg-white/[0.03] p-1.5">
          <div className="font-mono text-[8.5px] text-zinc-500 mb-0.5">MARGE</div>
          <div className="font-mono text-[11px] font-semibold text-emerald-400">{scene.margin}</div>
        </div>
        <div className="rounded bg-white/[0.03] p-1.5">
          <div className="font-mono text-[8.5px] text-zinc-500 mb-0.5">LIQ.</div>
          <div className="font-mono text-[11px] font-semibold text-zinc-100">{scene.liquidity.toFixed(2)}</div>
        </div>
      </div>
      <div className="px-3 pb-2 flex items-center justify-between">
        <div className="font-mono text-[9px] text-zinc-500">prix médian · 30j</div>
        <Sparkline points={scene.spark} color={scene.sparkColor} w={70} h={20} />
      </div>
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {scene.modifiers.map(([k, v], i) => {
          const c = v >= 0 ? "#10B981" : "#EF4444";
          return (
            <span
              key={i}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ color: c, background: c + "15", border: `1px solid ${c}40` }}
            >
              {k} {v >= 0 ? "+" : ""}{v}
            </span>
          );
        })}
      </div>
      <div className="px-3 pb-3 font-mono text-[9px] text-zinc-600">{scene.comps}</div>
    </div>
  );
}