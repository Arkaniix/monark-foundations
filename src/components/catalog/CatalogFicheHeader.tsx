import { useState } from "react";
import { ArrowLeft, Star, Calculator } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CatalogModelDetail } from "./modelDetail";
import { MANUFACTURER_DOT_COLOR, getScoreColor, hasMarketData } from "./datasets";

type Props = {
  detail: CatalogModelDetail;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEstimate: () => void;
};

export default function CatalogFicheHeader({
  detail,
  isFavorite,
  onToggleFavorite,
  onEstimate,
}: Props) {
  const scoreColor = getScoreColor(detail.score);
  const brandDot = MANUFACTURER_DOT_COLOR[detail.manufacturer];
  const [isStarPopping, setIsStarPopping] = useState(false);

  const handleStarClick = () => {
    setIsStarPopping(true);
    onToggleFavorite();
    setTimeout(() => setIsStarPopping(false), 250);
  };

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3.5"
      style={{
        background: "rgba(10,10,11,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <Link
          to="/catalogue"
          className="ease-expo flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          <span>CATALOGUE</span>
          <span style={{ color: "#3f3f46" }}>/</span>
          <span>{detail.category}</span>
        </Link>
        {hasMarketData(detail) && (
          <div
            className="rounded-md font-mono text-[10px] font-medium tracking-[0.12em]"
            style={{
              background: hexA(scoreColor, 0.12),
              border: `0.5px solid ${hexA(scoreColor, 0.4)}`,
              color: scoreColor,
              padding: "5px 10px",
            }}
          >
            SCORE {detail.score}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-[14px] font-medium leading-tight text-zinc-100">
            {detail.name}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: brandDot }}
            />
            <span className="font-mono text-[9.5px] tracking-[0.1em] text-zinc-400">
              {detail.manufacturer} · {detail.family}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={handleStarClick}
          className="ease-expo flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/[0.04]"
          style={{
            border: "0.5px solid rgba(255,255,255,0.08)",
            color: isFavorite ? "#F59E0B" : "#71717a",
            background: isFavorite ? "rgba(245,158,11,0.08)" : "transparent",
          }}
        >
          <Star
            size={14}
            strokeWidth={1.75}
            fill={isFavorite ? "#F59E0B" : "transparent"}
            className={isStarPopping ? "icon-pop" : ""}
          />
        </button>
        <button
          type="button"
          onClick={onEstimate}
          className="ease-expo flex items-center gap-2 rounded-md px-3.5 py-1.5 font-mono text-[10.5px] font-medium tracking-[0.1em] transition-colors hover:bg-blue-500/25"
          style={{
            background: "rgba(59,130,246,0.15)",
            border: "0.5px solid rgba(59,130,246,0.45)",
            color: "#60A5FA",
          }}
        >
          <Calculator size={12} strokeWidth={1.75} />
          ESTIMER →
        </button>
      </div>
    </div>
  );
}

function hexA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}