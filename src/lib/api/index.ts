/**
 * Point d'entrée du module API Monark.
 *
 * Selon VITE_USE_MOCK_API :
 *   - true  → authApi (et futurs domaines) pointent vers src/lib/mocks/*
 *   - false → authApi pointe vers les vraies implémentations src/lib/api/*
 *
 * Côté consommateur, aucune différence : `import { authApi } from "@/lib/api"`
 * fonctionne dans les deux modes.
 *
 * Voir src/lib/mocks/README ou les commentaires de src/lib/mocks/index.ts pour
 * l'extension à d'autres domaines (dashboard, estimator, etc.).
 */

import * as realAuth from "./auth";
import * as mockAuth from "../mocks/auth";
import { USE_MOCK_API } from "../mocks";

export * from "./client";
export * from "./endpoints";

export const authApi: typeof realAuth = USE_MOCK_API ? mockAuth : realAuth;
