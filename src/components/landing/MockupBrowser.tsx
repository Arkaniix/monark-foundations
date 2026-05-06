import { Lock } from "lucide-react";
import type { ReactNode } from "react";

type MockupBrowserProps = {
  domain?: string;
  platformLabel?: string;
  children?: ReactNode;
  progressCount?: number;
  progressActiveIdx?: number;
};

export default function MockupBrowser({
  domain = "l*boncoin.fr/ad/informatique/_id_29844",
  platformLabel = "LEBONCOIN",
  children,
  progressCount,
  progressActiveIdx = 0,
}: MockupBrowserProps) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "16 / 11" }}>
      <div
        className="absolute inset-0 rounded-xl border border-white/10 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
        style={{ background: "#0a0a0b" }}
      >
        <div
          className="h-9 border-b border-white/5 flex items-center px-3 gap-2"
          style={{ background: "rgba(24,24,27,0.6)" }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          </div>
          <div className="flex-1 mx-3 h-5 rounded bg-black/50 border border-white/5 flex items-center px-2 gap-1.5">
            <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="font-mono text-[10.5px] text-zinc-400 truncate">{domain}</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-500 tracking-wider">{platformLabel}</span>
        </div>
        <div className="absolute left-0 right-0 top-9 bottom-0">
          {children ?? (
            <div className="flex items-center justify-center h-full font-mono text-xs text-zinc-600 tracking-wider">
              [ SCÈNES À VENIR — P1.4 ]
            </div>
          )}
        </div>
        {progressCount && progressCount > 0 ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {Array.from({ length: progressCount }).map((_, i) => (
              <div key={i} className="h-[3px] w-9 rounded-full bg-white/10 overflow-hidden">
                <div
                  key={i + "-" + progressActiveIdx}
                  className={
                    i === progressActiveIdx
                      ? "h-full bg-zinc-300 progress-fill"
                      : i < progressActiveIdx
                      ? "h-full bg-zinc-300 w-full"
                      : "h-full bg-zinc-300 w-0"
                  }
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}