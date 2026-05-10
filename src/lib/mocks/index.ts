/**
 * Point d'entrée du layer mock.
 *
 * Activé par VITE_USE_MOCK_API=true dans .env (ou .env.local).
 * Consommé par src/lib/api/index.ts qui choisit entre real et mock au boot.
 *
 * Pour ajouter un nouveau domaine mock (dashboard, estimator, catalogue, etc.) :
 *   1. Créer src/lib/mocks/<domaine>.ts avec les implémentations qui honorent
 *      les signatures du module real correspondant (src/lib/api/<domaine>.ts).
 *   2. Ajouter `export * as <domaine>Api from "./<domaine>";` ci-dessous.
 *   3. Wire dans src/lib/api/index.ts (même pattern que authApi).
 */

export * as authApi from "./auth";

/**
 * Flag de routing real/mock. Lu une seule fois au boot.
 *
 * Note : Vite expose `import.meta.env.VITE_*` typé comme `string | undefined`.
 * On compare explicitement à `"true"` (chaîne) pour éviter les surprises avec
 * les valeurs `"false"`, `""`, ou absentes.
 */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
