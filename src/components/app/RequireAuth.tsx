import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import AppShellSplash from "./AppShellSplash";

type RequireAuthProps = {
  children: ReactNode;
};

/**
 * Guard pour les routes applicatives authentifiées.
 *
 * Comportement selon AuthContext.status :
 *   - "idle" | "loading"  → render <AppShellSplash />
 *   - "unauthenticated"   → useEffect navigate vers /auth, return null pendant la nav
 *   - "authenticated"     → render children
 *
 * Usage typique dans une route :
 *   import RequireAuth from "@/components/app/RequireAuth";
 *   import AppShell from "@/components/app/AppShell";
 *   import Dashboard from "@/pages/Dashboard";
 *
 *   export const Route = createFileRoute("/dashboard")({
 *     component: () => (
 *       <RequireAuth>
 *         <AppShell pageLabel="DASHBOARD" activePath="/dashboard">
 *           <Dashboard />
 *         </AppShell>
 *       </RequireAuth>
 *     ),
 *   });
 *
 * Note : la propagation du path d'origine via search param `?from=` n'est
 * pas implémentée ici — sera ajoutée quand le schéma de search params de
 * la route /auth sera typé (chantier ultérieur).
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "unauthenticated") {
      void navigate({ to: "/auth" });
    }
  }, [status, navigate]);

  if (status === "idle" || status === "loading") return <AppShellSplash />;
  if (status === "unauthenticated") return null;
  return <>{children}</>;
}
