import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Settings from "../pages/Settings";

export const Route = createFileRoute("/settings")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="PARAMÈTRES" activePath="/settings">
        <Settings />
      </AppShell>
    </RequireAuth>
  ),
});
