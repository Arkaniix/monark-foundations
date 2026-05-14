import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Watchlist from "../pages/Watchlist";

export const Route = createFileRoute("/watchlist")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="WATCHLIST" activePath="/watchlist">
        <Watchlist />
      </AppShell>
    </RequireAuth>
  ),
});