import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Dashboard from "../pages/Dashboard";

/**
 * Route /dashboard — première route applicative protégée.
 *
 * Pattern à reproduire pour toutes les futures routes app (estimator, catalogue,
 * watchlist, stock, repair, settings, etc.) :
 *
 *   <RequireAuth>
 *     <AppShell pageLabel="LABEL" activePath="/path">
 *       <PageComponent />
 *     </AppShell>
 *   </RequireAuth>
 *
 * RequireAuth gère splash + redirect /auth si pas authentifié.
 * AppShell consomme useAuth() pour user + onLogout, et passe activePath
 * à la sidebar pour le styling de l'item de nav courant.
 */
export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="DASHBOARD" activePath="/dashboard">
        <Dashboard />
      </AppShell>
    </RequireAuth>
  ),
});
