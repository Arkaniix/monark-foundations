import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import SettingsFiscal from "../pages/SettingsFiscal";

export const Route = createFileRoute("/settings/fiscal")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="PARAMÈTRES · FISCALITÉ" activePath="/settings/fiscal">
        <SettingsFiscal />
      </AppShell>
    </RequireAuth>
  ),
});
