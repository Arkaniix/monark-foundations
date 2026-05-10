/**
 * Page Dashboard — version placeholder C0.
 *
 * Cette version sert UNIQUEMENT à valider le câblage RequireAuth + AppShell +
 * redirection post-signin. Elle sera entièrement réécrite au chantier C1
 * avec le vrai contenu : stat tiles, recent estimations, watchlist preview.
 *
 * Ne pas ajouter de contenu métier ici en attendant — toute logique doit
 * vivre dans des sous-composants `src/components/dashboard/*` créés à C1.
 */

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 00
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          PLACEHOLDER C0
        </div>
      </div>

      <div className="mk-card fade-up p-8">
        <h1 className="text-[18px] font-semibold text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-zinc-500">
          Placeholder du chantier C0 — sert à valider end-to-end le flow
          signin → redirection /dashboard → RequireAuth → AppShell rendu.
        </p>
        <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-zinc-600">
          Le vrai contenu (stat tiles, dernières estimations, watchlist)
          arrivera au chantier C1.
        </p>

        <div
          className="mt-5 rounded-md p-3 font-mono text-[11px] leading-relaxed text-zinc-400"
          style={{ background: "var(--mk-surface-2)" }}
        >
          {`status === "authenticated"  →  RequireAuth pass-through`}
          <br />
          {`AppShell wraps Dashboard with sidebar + topbar + main`}
          <br />
          {`User loaded from authApi.getMe() (mock or real)`}
        </div>
      </div>
    </div>
  );
}
