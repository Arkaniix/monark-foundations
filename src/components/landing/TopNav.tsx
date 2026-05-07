import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Logo from "@/components/ui/Logo";

type PillState = { left: number; top: number; width: number; height: number; visible: boolean };

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
  const [pill, setPill] = useState<PillState>({ left: 0, top: 0, width: 0, height: 0, visible: false });

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

  const recomputePill = useCallback(() => {
    const target = hoverId || activeId;
    if (!target || !linkRefs.current[target]) {
      setPill((p) => ({ ...p, visible: false }));
      return;
    }
    const link = linkRefs.current[target]!;
    setPill({
      left: link.offsetLeft,
      top: link.offsetTop,
      width: link.offsetWidth,
      height: link.offsetHeight,
      visible: true,
    });
  }, [hoverId, activeId]);

  useEffect(() => {
    recomputePill();
  }, [recomputePill]);

  useEffect(() => {
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) recomputePill();
      });
    }
    const onResize = () => recomputePill();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [recomputePill]);

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
              className="absolute rounded-md bg-white/[0.06] border border-white/10 pointer-events-none"
              style={{
                left: pill.left,
                top: pill.top,
                width: pill.width,
                height: pill.height,
                opacity: pill.visible ? 1 : 0,
                transform: `scale(${pill.visible ? 1 : 0.96})`,
                transition:
                  "left 380ms cubic-bezier(0.16,1,0.3,1), top 380ms cubic-bezier(0.16,1,0.3,1), width 380ms cubic-bezier(0.16,1,0.3,1), height 380ms cubic-bezier(0.16,1,0.3,1), opacity 220ms ease, transform 380ms cubic-bezier(0.16,1,0.3,1)",
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