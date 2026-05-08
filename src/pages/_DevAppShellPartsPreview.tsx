import { useState } from "react";
import AppShellSplash from "../components/app/AppShellSplash";
import UserMenu from "../components/app/UserMenu";

/**
 * Page de référence visuelle pour les briques du chrome AppShell (chantier A2).
 * Accessible sur /_dev/appshell-parts. Sera supprimée au chantier A3 quand
 * l'AppShell complet aura sa propre route /_dev/appshell.
 *
 * Scènes A2a : SPLASH, USERMENU.
 * Scènes A2b à venir : SIDEBAR, TOPBAR (extension du présent fichier).
 */

type Scene = "splash" | "usermenu";

const SCENES: { id: Scene; label: string }[] = [
  { id: "splash", label: "01 SPLASH" },
  { id: "usermenu", label: "02 USERMENU" },
];

const MOCK_USER = {
  email: "etienne@monark-market.fr",
  full_name: "Etienne",
  subscription_tier: "standard" as const,
};

export default function _DevAppShellPartsPreview() {
  const [scene, setScene] = useState<Scene>("splash");

  return (
    <>
      <SceneBar scene={scene} onChange={setScene} />
      {scene === "splash" && <AppShellSplash />}
      {scene === "usermenu" && <UserMenuScene />}
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
      className="fixed right-3 top-3 z-[999] flex items-center gap-1 rounded-md p-1"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {SCENES.map((s) => (
        <button
          key={s.id}
          type="button"
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
    <div className="relative z-10 min-h-screen px-8 py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="font-mono text-[10px] tracking-widest text-zinc-500">
          § A2.UM ─── USERMENU ISOLÉ
        </div>
        <div className="text-[13px] text-zinc-400">
          Cliquer sur la pill pour ouvrir le dropdown.
          <br />
          Cliquer en dehors pour fermer.
        </div>
        <div className="flex justify-end">
          <UserMenu user={MOCK_USER} onLogout={() => alert("logout()")} />
        </div>
        <div className="text-[12px] text-zinc-500">
          Mock user :{" "}
          <span className="font-mono">etienne@monark-market.fr</span> · plan{" "}
          <span className="font-mono">Standard</span>.
        </div>
      </div>
    </div>
  );
}