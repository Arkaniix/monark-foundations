import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import SettingsNotifications from "../pages/SettingsNotifications";

export const Route = createFileRoute("/settings_/notifications")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="PARAMÈTRES · NOTIFICATIONS" activePath="/settings/notifications">
        <SettingsNotifications />
      </AppShell>
    </RequireAuth>
  ),
});
