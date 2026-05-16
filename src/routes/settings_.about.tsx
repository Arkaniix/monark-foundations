import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import SettingsAbout from "../pages/SettingsAbout";

export const Route = createFileRoute("/settings/about")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="PARAMÈTRES · À PROPOS" activePath="/settings/about">
        <SettingsAbout />
      </AppShell>
    </RequireAuth>
  ),
});
