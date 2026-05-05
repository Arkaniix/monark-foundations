import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Logo from "@/components/ui/Logo";

type PillState = { left: number; width: number; visible: boolean };

export default function TopNav() {
  const links = [
    { id: "lens", label: "Extension" },
    { id: "estimator", label: "Estimateur" },
    { id: "stock", label: "Outils complémentaires" },
    { id: "tarifs", label: "Tarifs" },
  ];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pill, setPill] = useState<PillState>({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const ids = links.map((l) => l.id);
    const onScroll = () => {
      let best: string | null = null;
      let bestDist = Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top - 80);
        if (r.top - 80 <= 0 && r.bottom > 80 && dist < bestDist) {
          best = id;
          bestDist = dist;
        }
      }
      setActiveId(best);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = hoverId || activeId;
    if (!target || !containerRef.current || !linkRefs.current[target]) {
      setPill((p) => ({ ...p, visible: false }));
      return;
    }
    const cRect = containerRef.current.getBoundingClientRect();
    const lRect = linkRefs.current[target]!.getBoundingClientRect();
    setPill({ left: lRect.left - cRect.left, width: lRect.width, visible: true });
  }, [hoverId, activeId]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 56;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 h-14 bg-black/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1320px] mx-auto h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/">
            <Logo />
          </Link>
          <div
            ref={containerRef}
            onMouseLeave={() => setHoverId(null)}
            className="hidden md:flex items-center relative text-[13px] text-zinc-400"
          >
            <div
              aria-hidden
              className="absolute top-1/2 -translate-y-1/2 rounded-md bg-white/[0.06] border border-white/10 pointer-events-none"
              style={{
                left: pill.left,
                width: pill.width,
                height: 28,
                opacity: pill.visible ? 1 : 0,
                transform: `translateY(-50%) scale(${pill.visible ? 1 : 0.96})`,
                transition:
                  "left 380ms cubic-bezier(0.16,1,0.3,1), width 380ms cubic-bezier(0.16,1,0.3,1), opacity 220ms ease, transform 380ms cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {links.map((l) => {
              const isActive = activeId === l.id;
              return (
                <a
                  key={l.id}
                  ref={(el) => {
                    linkRefs.current[l.id] = el;
                  }}
                  href={`#${l.id}`}
                  onClick={(e) => onClick(e, l.id)}
                  onMouseEnter={() => setHoverId(l.id)}
                  className={
                    "relative px-3.5 py-1.5 rounded-md ease-expo transition-colors " +
                    (isActive ? "text-zinc-50" : "hover:text-zinc-100")
                  }
                  style={{ transition: "color 220ms ease" }}
                >
                  {l.label}
                </a>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden sm:inline text-[13px] text-zinc-400 hover:text-zinc-100"
          >
            Connexion
          </Link>
          <a
            href="#tarifs"
            onClick={(e) => onClick(e, "tarifs")}
            className="btn-shimmer text-[13px] font-medium px-3.5 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 ease-expo transition-colors"
          >
            Essayer gratuitement
          </a>
        </div>
      </div>
    </nav>
  );
}