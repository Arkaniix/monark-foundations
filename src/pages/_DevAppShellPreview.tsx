import { useState, useMemo, type ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import { Skeleton, EmptyState } from "../components/ui";
import { Inbox } from "lucide-react";

/**
 * Page de preview pour l'AppShell complet (chantier A3b).
 * Accessible sur /_dev/appshell. Remplace l'ancienne preview /_dev/appshell-parts
 * qui montrait les briques isolées.
 *
 * Trois états simulés via MockAuthProvider :
 *   - "authenticated" → RequireAuth rend AppShell + contenu Dashboard mock
 *   - "loading"       → RequireAuth rend AppShellSplash
 *   - "unauthenticated" → cas particulier, voir UnauthenticatedScene plus bas
 *
 * Le toggle de simulation est en haut à droite (mono pill, mêmes specs que la
 * SceneBar de l'ancienne preview).
 */

type SimState = "authenticated" | "loading" | "unauthenticated";

const STATES: { id: SimState; label: string }[] = [
  { id: "authenticated", label: "01 AUTH" },
  { id: "loading", label: "02 LOADING" },
  { id: "unauthenticated", label: "03 UNAUTH" },
];

const MOCK_USER = {
  id: "u_dev_etienne",
  email: "etienne@monark-market.fr",
  full_name: "Etienne",
  created_at: "2025-09-12T10:00:00Z",
  subscription_tier: "standard" as const,
  credits_remaining: 89,
};

/**
 * MockAuthProvider — wrap children dans le AuthContext.Provider avec une valeur
 * forgée selon l'état simulé. Ne touche jamais au vrai backend ni aux tokens.
 *
 * IMPORTANT : on NE wrappe pas l'état "unauthenticated" avec ce provider, car
 * RequireAuth déclencherait une vraie redirection vers /auth via useNavigate,
 * sortant de la preview. Voir UnauthenticatedScene pour la stratégie alternative.
 */
function MockAuthProvider({
  state,
  children,
}: {
  state: Exclude<SimState, "unauthenticated">;
  children: ReactNode;
}) {
  const value = useMemo(() => {
    const noop = async () => {};
    if (state === "authenticated") {
      return {
        user: MOCK_USER,
        status: "authenticated" as const,
        login: noop,
        register: noop,
        logout: noop,
        forgotPassword: noop,
        refreshUser: noop,
      };
    }
    return {
      user: null,
      status: "loading" as const,
      login: noop,
      register: noop,
      logout: noop,
      forgotPassword: noop,
      refreshUser: noop,
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function _DevAppShellPreview() {
  const [state, setState] = useState<SimState>("authenticated");

  return (
    <>
      <StateBar state={state} onChange={setState} />
      {state === "unauthenticated" ? (
        <UnauthenticatedScene />
      ) : (
        <MockAuthProvider state={state}>
          <RequireAuth>
            <AppShell pageLabel="DASHBOARD" activePath="/dashboard">
              <DashboardMockContent />
            </AppShell>
          </RequireAuth>
        </MockAuthProvider>
      )}
    </>
  );
}

function StateBar({
  state,
  onChange,
}: {
  state: SimState;
  onChange: (s: SimState) => void;
}) {
  return (
    <div
      className="fixed right-3 top-3 z-[999] flex gap-1 rounded-lg p-1"
      style={{
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {STATES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={
            "ease-expo rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-wider transition-colors " +
            (state === s.id
              ? "text-zinc-50"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100")
          }
          style={
            state === s.id ? { background: "rgba(59,130,246,0.18)" } : undefined
          }
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Contenu mock placé dans le main de l'AppShell pour montrer comment une vraie
 * page applicative s'intégrera. Mélange Skeleton + EmptyState + une mk-card
 * avec du texte fixe pour montrer la respiration du layout.
 */
function DashboardMockContent() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 01
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          VUE D'ENSEMBLE
        </div>
      </div>

      {/* 4 stat tiles mock avec skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="mk-card p-5">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="mt-3 h-8 w-32 rounded" />
          <Skeleton className="mt-4 h-2 w-full rounded" />
        </div>
        <div className="mk-card p-5">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="mt-3 h-8 w-28 rounded" />
          <Skeleton className="mt-4 h-2 w-full rounded" />
        </div>
        <div className="mk-card p-5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="mt-3 h-8 w-36 rounded" />
          <Skeleton className="mt-4 h-2 w-full rounded" />
        </div>
        <div className="mk-card p-5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="mt-3 h-8 w-24 rounded" />
          <Skeleton className="mt-4 h-2 w-full rounded" />
        </div>
      </div>

      {/* Section vide pour montrer EmptyState dans le contexte */}
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 02
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          DERNIÈRES ESTIMATIONS
        </div>
      </div>

      <EmptyState
        icon={Inbox}
        title="Aucune estimation pour l'instant"
        description="Vos évaluations apparaîtront ici dès que vous aurez utilisé l'estimateur ou la Lens sur une annonce."
        cta={{
          label: "Lancer l'estimateur",
          onClick: () => alert("→ /estimator"),
        }}
      />

      <div className="font-mono text-[10px] tracking-wider text-zinc-700">
        // PLACEHOLDER — futur contenu Dashboard ici
      </div>
    </div>
  );
}

/**
 * Scène "unauthenticated" — affichée SANS MockAuthProvider ni RequireAuth, car
 * RequireAuth déclencherait une vraie navigation vers /auth via useNavigate,
 * sortant de la preview.
 *
 * On affiche à la place une explication textuelle de ce que RequireAuth ferait
 * dans ce cas, avec un récap du comportement attendu pour validation par
 * code review.
 */
function UnauthenticatedScene() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
      <div className="mk-card flex max-w-xl flex-col gap-5 p-8">
        <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          § A3.UNAUTH ─── COMPORTEMENT ATTENDU
        </div>
        <div className="text-[14px] font-medium text-zinc-200">
          État simulé : <span className="font-mono text-zinc-300">unauthenticated</span>
        </div>
        <div className="text-[13px] leading-relaxed text-zinc-400">
          Dans cet état, <span className="font-mono text-zinc-300">RequireAuth</span>{" "}
          déclencherait <span className="font-mono text-zinc-300">navigate</span>(
          <span className="font-mono text-zinc-300">{`{ to: "/auth" }`}</span>) via{" "}
          <span className="font-mono text-zinc-300">useEffect</span> et retournerait{" "}
          <span className="font-mono text-zinc-300">null</span> pendant la
          navigation, évitant tout flash de contenu.
        </div>
        <div className="text-[12.5px] leading-relaxed text-zinc-500">
          La preview ne déclenche pas réellement la nav (sinon elle sortirait
          d'elle-même). Pour valider runtime, accéder directement à une route
          applicative protégée (ex.{" "}
          <span className="font-mono">/dashboard</span> quand elle existera) sans
          token : le browser doit redirect vers{" "}
          <span className="font-mono">/auth</span>.
        </div>
        <div
          className="mt-2 rounded-md p-3 font-mono text-[11px] leading-relaxed text-zinc-400"
          style={{ background: "var(--mk-surface-2)" }}
        >
          {`if (status === "unauthenticated") {`}
          <br />
          {`  void navigate({ to: "/auth" });`}
          <br />
          {`}`}
          <br />
          {`return null;`}
        </div>
      </div>
    </div>
  );
}
