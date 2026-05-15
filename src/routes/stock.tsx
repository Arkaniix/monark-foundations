import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Stock from "../pages/Stock";

export const Route = createFileRoute("/stock")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="INVENTAIRE" activePath="/stock">
        <Stock />
      </AppShell>
    </RequireAuth>
  ),
});
