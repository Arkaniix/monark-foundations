import { useState } from "react";
import AppShellSplash from "../components/app/AppShellSplash";
import UserMenu from "../components/app/UserMenu";
import AppSidebar from "../components/app/AppSidebar";
import AppTopbar from "../components/app/AppTopbar";

/**
 * Page de référence visuelle pour les briques du chrome AppShell (chantier A2).
 * Accessible sur /_dev/appshell-parts. Sera supprimée au chantier A3 quand
 * l'AppShell complet aura sa propre route /_dev/appshell.
 *
 * Scènes : SPLASH (A2a), USERMENU (A2a), SIDEBAR (A2b), TOPBAR (A2b).
 */

type Scene = "splash" | "usermenu" | "sidebar" | "topbar";

const SCENES: { id: Scene; label: string }[] = [
  { id: "splash", label: "01 SPLASH" },
  { id: "usermenu", label: "02 USERMENU" },
  { id: "sidebar", label: "03 SIDEBAR" },
  { id: "topbar", label: "04 TOPBAR" },
];

const MOCK_USER = {
  email: "etienne@monark-market.fr",
  full_name: "Etienne",
  subscription_tier: "standard" as const,
  credits_remaining: 89,
};

export default function _DevAppShellPartsPreview() {
  const [scene, setScene] = useState<Scene>("splash");

  return (
    <>
      <SceneBar scene={scene} onChange={setScene} />
      {scene === "splash" && <AppShellSplash />}
      {scene === "usermenu" && <UserMenuScene />}
      {scene === "sidebar" && <SidebarScene />}
      {scene === "topbar" && <TopbarScene />}
    </>
  );
}

function SceneBar({
  scene,
  onChange,
}: {
  scene: Scene;
  onChange: (s: Scene) => void;
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
      {SCENES.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={
            "ease-expo rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-wider transition-colors " +
            (scene === s.id
              ? "text-zinc-50"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100")
          }
          style={
            scene === s.id
              ? { background: "rgba(59,130,246,0.18)" }
              : undefined
          }
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function UserMenuScene() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
      <div className="flex flex-col items-center gap-8">
        <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          § A2.UM ─── USERMENU ISOLÉ
        </div>
        <div className="text-center text-[13px] text-zinc-500">
          Cliquer sur la pill pour ouvrir le dropdown.
          <br />
          Cliquer en dehors pour fermer.
        </div>
        <UserMenu user={MOCK_USER} onLogout={() => alert("logout()")} />
        <div className="mt-4 max-w-md text-center text-[12px] text-zinc-600">
          <strong className="text-zinc-500">Mock user :</strong>{" "}
          etienne@monark-market.fr · plan{" "}
          <span className="font-mono">Standard</span>.
        </div>
      </div>
    </div>
  );
}

function SidebarScene() {
  return (
    <div className="relative z-10 flex min-h-screen">
      <AppSidebar
        activePath="/dashboard"
        user={MOCK_USER}
        onLogout={() => alert("logout()")}
      />
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
            § A2.SB ─── SIDEBAR ISOLÉE
          </div>
          <div className="max-w-md text-[13px] text-zinc-500">
            Active : <span className="font-mono">/dashboard</span>. Crédits :{" "}
            <span className="font-mono">89 / 180</span> (jauge ambre, &lt;50%).
          </div>
          <div className="text-[12px] text-zinc-600">
            Espace main réservé aux pages applicatives futures.
          </div>
        </div>
      </div>
    </div>
  );
}

function TopbarScene() {
  return (
    <div className="relative z-10 min-h-screen">
      <AppTopbar
        pageLabel="DASHBOARD"
        user={MOCK_USER}
        onLogout={() => alert("logout()")}
        onToggleMobileNav={() => alert("toggleMobileNav()")}
      />
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
            § A2.TB ─── TOPBAR ISOLÉE
          </div>
          <div className="max-w-md text-[13px] text-zinc-500">
            Breadcrumb mono{" "}
            <span className="font-mono">MONARK / DASHBOARD</span> à gauche,
            UserMenu à droite. Bouton hamburger visible en mobile (md:hidden).
          </div>
          <div className="text-[12px] text-zinc-600">
            Espace main réservé aux pages applicatives futures.
          </div>
        </div>
      </div>
    </div>
  );
}
