/**
 * Point d'entrée du module API Monark.
 *
 * Pour chaque domaine, choisit entre vraie implémentation et mock selon
 * VITE_USE_MOCK_API. Côté consommateur, l'API publique est stable :
 * `import { authApi, dashboardApi } from "@/lib/api"` fonctionne dans les
 * deux modes.
 *
 * Pour ajouter un nouveau domaine (estimator, catalogue, etc.) :
 *   1. Créer src/lib/api/<domaine>.ts (real impl, placeholder OK)
 *   2. Créer src/lib/mocks/<domaine>.ts (mock impl, signatures alignées)
 *   3. Ajouter le réexport dans src/lib/mocks/index.ts
 *   4. Ajouter le routing real/mock ci-dessous (même pattern que dashboardApi)
 */

import * as realAuth from "./auth";
import * as realDashboard from "./dashboard";
import * as realEstimator from "./estimator";
import * as mockAuth from "../mocks/auth";
import * as mockDashboard from "../mocks/dashboard";
import * as mockEstimator from "../mocks/estimator";
import { USE_MOCK_API } from "../mocks";

export * from "./client";
export * from "./endpoints";

export const authApi: typeof realAuth = USE_MOCK_API ? mockAuth : realAuth;
export const dashboardApi: typeof realDashboard = USE_MOCK_API
  ? mockDashboard
  : realDashboard;
export const estimatorApi: typeof realEstimator = USE_MOCK_API
  ? mockEstimator
  : realEstimator;
