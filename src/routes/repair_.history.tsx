import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import RepairHistory from "../pages/RepairHistory";

export const Route = createFileRoute("/repair_/history")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="REPAIR GUIDE · HISTORIQUE" activePath="/repair">
        <RepairHistory />
      </AppShell>
    </RequireAuth>
  ),
});