import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import RepairSymptom from "../pages/RepairSymptom";

export const Route = createFileRoute("/repair_/$slug")({
  component: RepairSymptomRouteComponent,
});

function RepairSymptomRouteComponent() {
  const { slug } = Route.useParams();
  return (
    <RequireAuth>
      <AppShell pageLabel="REPAIR GUIDE · DIAGNOSTIC" activePath="/repair">
        <RepairSymptom slug={slug} />
      </AppShell>
    </RequireAuth>
  );
}