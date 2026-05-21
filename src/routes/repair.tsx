import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Repair from "../pages/Repair";

export const Route = createFileRoute("/repair")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="REPAIR GUIDE" activePath="/repair">
        <Repair />
      </AppShell>
    </RequireAuth>
  ),
});