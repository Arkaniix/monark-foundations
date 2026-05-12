import { createFileRoute } from "@tanstack/react-router";
import DashboardStatesPreview from "@/pages/DashboardStatesPreview";

/**
 * Route dev /_dev/dashboard-states — preview des 4 états du Dashboard.
 *
 * Accessible sans authentification (pattern aligné sur /_dev/ui et
 * /_dev/appshell). Pas wrappée dans AppShell ni RequireAuth — la preview
 * gère son propre layout pleine page.
 */

export const Route = createFileRoute("/_dev/dashboard-states")({
  component: DashboardStatesPreview,
});
