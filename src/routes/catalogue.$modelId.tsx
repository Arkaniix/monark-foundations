import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import CatalogModelDetail from "../pages/CatalogModelDetail";

export const Route = createFileRoute("/catalogue/$modelId")({
  component: CatalogModelDetailRouteComponent,
});

function CatalogModelDetailRouteComponent() {
  const { modelId } = Route.useParams();
  return (
    <RequireAuth>
      <AppShell pageLabel="CATALOGUE" activePath="/catalogue">
        <CatalogModelDetail modelId={modelId} />
      </AppShell>
    </RequireAuth>
  );
}