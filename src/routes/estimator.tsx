import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Estimator from "../pages/Estimator";

export const Route = createFileRoute("/estimator")({
  component: () => (
    <RequireAuth>
      <AppShell pageLabel="ESTIMATEUR" activePath="/estimator">
        <Estimator />
      </AppShell>
    </RequireAuth>
  ),
});