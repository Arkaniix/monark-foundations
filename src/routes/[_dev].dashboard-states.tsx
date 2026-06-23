import { createFileRoute } from "@tanstack/react-router";
import DashboardStatesPreview from "@/pages/DashboardStatesPreview";

export const Route = createFileRoute("/_dev/dashboard-states")({
  component: DashboardStatesPreview,
});