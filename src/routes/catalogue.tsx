import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Catalog from "../pages/Catalog";

export const Route = createFileRoute("/catalogue")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="CATALOGUE" activePath="/catalogue">
        <Catalog />
      </AppShell>
    </RequireAuth>
  ),
});