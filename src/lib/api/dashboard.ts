/**
 * Vraie implémentation Dashboard API.
 *
 * Pour l'instant, placeholder qui throw "not implemented" — l'endpoint backend
 * `/v1/dashboard/overview` n'existe pas encore côté monark-api. À implémenter
 * quand le backend FastAPI exposera la route correspondante.
 *
 * En mode VITE_USE_MOCK_API=true (default dev/preview), cette fonction n'est
 * jamais appelée — le wrapper api/index.ts route vers le mock.
 */

import { ApiException } from "./client";
// import { apiFetch } from "./client";  // décommenter quand le backend sera prêt
// import { ENDPOINTS } from "./endpoints";  // ajouter une const DASHBOARD_OVERVIEW
import type { DashboardOverview } from "../../components/dashboard/datasets";

export async function getOverview(): Promise<DashboardOverview> {
  // TODO(backend) : implémenter quand /v1/dashboard/overview sera disponible
  // return apiFetch<DashboardOverview>(ENDPOINTS.DASHBOARD_OVERVIEW, { method: "GET" });
  throw new ApiException(
    501,
    "Dashboard overview endpoint not yet implemented in backend. Use VITE_USE_MOCK_API=true.",
    "NOT_IMPLEMENTED",
  );
}
