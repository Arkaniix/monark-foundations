import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import SettingsData from "../pages/SettingsData";

export const Route = createFileRoute("/settings/data")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="PARAMÈTRES · DONNÉES" activePath="/settings/data">
        <SettingsData />
      </AppShell>
    </RequireAuth>
  ),
});
