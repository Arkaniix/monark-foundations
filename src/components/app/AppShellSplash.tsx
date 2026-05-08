import Logo from "../ui/Logo";

/**
 * Splash plein écran affiché par RequireAuth (créé en A3) pendant que
 * l'AuthContext est en status "idle" ou "loading". Aucune prop.
 */
export default function AppShellSplash() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0A0A0B]">
      <div className="fade-up flex flex-col items-center gap-6">
        <Logo />
        <div
          className="h-6 w-6 animate-spin rounded-full"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderTopColor: "rgba(255,255,255,0.7)",
          }}
        />
        <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          CHARGEMENT
        </div>
      </div>
    </div>
  );
}