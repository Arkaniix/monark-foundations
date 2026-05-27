import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import PendingDeletionBanner from "../PendingDeletionBanner";

type AppShellProps = {
  children: ReactNode;
  pageLabel?: string;
  activePath?: string;
};

/**
 * Orchestrateur de layout pour les pages applicatives authentifiées.
 *
 * Toujours utilisé wrappé dans <RequireAuth>, qui garantit que le user est
 * authentifié au moment du render. Si pour une raison quelconque user est
 * null (cas dégénéré), le composant retourne null — c'est RequireAuth qui
 * gère le splash + redirection.
 *
 * Structure : sidebar 240px sticky + (topbar 56px sticky + main scrollable).
 * Main wrapped dans un container max-width 1320px, padding réactif.
 */
export default function AppShell({ children, pageLabel, activePath }: AppShellProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="relative z-10 flex min-h-screen">
      <AppSidebar
        activePath={activePath}
        user={{
          subscription_tier: user.subscription_tier,
          credits_remaining: user.credits_remaining,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          pageLabel={pageLabel}
          user={{
            email: user.email,
            full_name: user.full_name,
            subscription_tier: user.subscription_tier,
          }}
          onLogout={handleLogout}
        />
        <PendingDeletionBanner />
        <main className="flex-1 px-6 py-8 md:px-8">
          <div className="mx-auto" style={{ maxWidth: 1320 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
