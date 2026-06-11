import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Credits from "../pages/Credits";

export const Route = createFileRoute("/credits")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="CRÉDITS" activePath="/credits">
        <Credits />
      </AppShell>
    </RequireAuth>
  ),
});