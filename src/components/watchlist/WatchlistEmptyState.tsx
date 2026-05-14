import { Star, Bell, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { WatchlistTabKey } from "./datasets";

type Props = {
  tab: WatchlistTabKey;
};

const COPY: Record<
  WatchlistTabKey,
  {
    Icon: typeof Star;
    iconColor: string;
    iconBg: string;
    iconRing: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaBg: string;
    ctaText: string;
  }
> = {
  favorites: {
    Icon: Star,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.10)",
    iconRing: "rgba(245,158,11,0.22)",
    title: "Aucun modèle épinglé",
    body:
      "Épinglez les modèles que vous voulez garder à portée de main. Idéal pour suivre les composants que vous achetez régulièrement.",
    ctaLabel: "PARCOURIR LE CATALOGUE",
    ctaBg: "rgba(245,158,11,0.14)",
    ctaText: "#F59E0B",
  },
  alerts: {
    Icon: Bell,
    iconColor: "#3B82F6",
    iconBg: "rgba(59,130,246,0.10)",
    iconRing: "rgba(59,130,246,0.22)",
    title: "Aucune alerte active",
    body:
      "Activez la cloche sur un modèle pour être notifié des mouvements de prix significatifs (±5% par rapport à la médiane au moment d'activation).",
    ctaLabel: "PARCOURIR LE CATALOGUE",
    ctaBg: "rgba(59,130,246,0.14)",
    ctaText: "#3B82F6",
  },
};

export default function WatchlistEmptyState({ tab }: Props) {
  const navigate = useNavigate();
  const copy = COPY[tab];
  const Icon = copy.Icon;

  return (
    <div className="mk-card-flat-soft flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: copy.iconBg,
          border: `0.5px solid ${copy.iconRing}`,
        }}
      >
        <Icon size={22} strokeWidth={1.5} style={{ color: copy.iconColor }} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-base font-medium text-zinc-100">{copy.title}</h2>
        <p className="max-w-md text-sm leading-6 text-zinc-500">{copy.body}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate({ to: "/catalogue" })}
        className="ease-expo group flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
        style={{ background: copy.ctaBg }}
      >
        <span
          className="font-mono text-[10.5px] tracking-[0.14em]"
          style={{ color: copy.ctaText }}
        >
          {copy.ctaLabel}
        </span>
        <ArrowRight
          size={12}
          strokeWidth={1.75}
          style={{ color: copy.ctaText }}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
}