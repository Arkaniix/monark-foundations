import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import SettingsPreferences from "../pages/SettingsPreferences";

export const Route = createFileRoute("/settings_/preferences")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="PARAMÈTRES · PRÉFÉRENCES" activePath="/settings/preferences">
        <SettingsPreferences />
      </AppShell>
    </RequireAuth>
  ),
});
