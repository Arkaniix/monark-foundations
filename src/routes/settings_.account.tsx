import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import SettingsAccount from "../pages/SettingsAccount";

export const Route = createFileRoute("/settings_/account")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="PARAMÈTRES · COMPTE" activePath="/settings/account">
        <SettingsAccount />
      </AppShell>
    </RequireAuth>
  ),
});
