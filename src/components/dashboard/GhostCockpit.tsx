/* src/components/dashboard/GhostCockpit.tsx
   État vide du dashboard — visuel fantôme (aucune valeur lisible) + cartouche.
   Affiché quand l'utilisateur n'a aucune pièce en stock. */

const GHOST_BARS = [38, 54, 30, 62, 46, 72, 58, 80];

function GhostVisual() {
  const R = 46;
  const C = 2 * Math.PI * R;
  const GAP = 2;
  const parts = [
    { p: 0.40, o: 0.20 },
    { p: 0.26, o: 0.14 },
    { p: 0.18, o: 0.10 },
    { p: 0.16, o: 0.07 },
  ];
  let cum = 0;
  const segs = parts.map((s) => {
    const len = Math.max(0, s.p * C - GAP);
    const off = -cum * C;
    cum += s.p;
    return { len, off, o: s.o };
  });
  return (
    <div className="relative ghost-sweep rounded-xl overflow-hidden" style={{ minHeight: 230 }}>
      <div className="absolute inset-0 ghost-halo" />
      <div className="relative flex items-center justify-center gap-12 py-9 px-6 ghost-breathe">
        <svg viewBox="0 0 120 120" width={150} height={150} className="shrink-0">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
          <g className="ghost-ring-rot" style={{ transformOrigin: "60px 60px", transformBox: "view-box" }}>
            {segs.map((s, i) => (
              <circle key={i} cx="60" cy="60" r={R} fill="none" stroke="#60A5FA" strokeWidth={12}
                strokeLinecap="butt"
                style={{ strokeDasharray: `${s.len} ${C - s.len}`, strokeDashoffset: s.off, opacity: s.o }} />
            ))}
          </g>
          <circle cx="60" cy="60" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="2 4" />
        </svg>
        <div className="hidden sm:flex items-end gap-2.5 h-32">
          {GHOST_BARS.map((h, i) => (
            <div key={i} className="ghost-bar w-5 rounded-t-md" style={{
              height: h + "%",
              background: "linear-gradient(180deg, rgba(96,165,250,0.18), rgba(96,165,250,0.04))",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
              animationDelay: i * 0.22 + "s",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmptyCockpit() {
  return (
    <div className="mk-card-flat-soft p-8 sm:p-10">
      <GhostVisual />
      <div className="text-center max-w-md mx-auto mt-7">
        <h2 className="text-[19px] font-semibold tracking-tight text-zinc-100">Ton cockpit prend vie ici</h2>
        <p className="mt-2 text-[13px] text-zinc-500 leading-relaxed">
          Profits réalisés, capital engagé, stock à écouler et tendances s'afficheront automatiquement dès tes premières opérations.
        </p>
      </div>
    </div>
  );
}

export default EmptyCockpit;