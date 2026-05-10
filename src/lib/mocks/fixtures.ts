/**
 * Mock fixtures pour le développement local et la preview Lovable.
 *
 * Le layer mock est activé par VITE_USE_MOCK_API=true dans .env. Toutes les
 * requêtes API sont alors interceptées au niveau de src/lib/api/index.ts et
 * remplacées par les implémentations de src/lib/mocks/.
 *
 * Ces fixtures ne sont jamais consommées en production (VITE_USE_MOCK_API=false).
 */

import type { User } from "../api/client";

/**
 * Utilisateur mock retourné par toutes les opérations auth en mode mock.
 * Aligné sur le type User de src/lib/api/client.ts.
 *
 * Tier "standard", 89 crédits sur 180 → jauge ambre dans la sidebar.
 * Modifier ici pour tester d'autres états :
 *   - subscription_tier: "free" → cap 10
 *   - subscription_tier: "pro" → cap 600
 *   - credits_remaining très bas → jauge rouge
 *   - credits_remaining élevé → jauge verte
 */
export const MOCK_USER: User = {
  id: "u_mock_etienne",
  email: "etienne@monark-market.fr",
  full_name: "Etienne",
  created_at: "2025-09-12T10:00:00Z",
  subscription_tier: "standard",
  credits_remaining: 89,
};

/**
 * Tokens mock posés dans localStorage par login/register mock.
 * Lisibles par getAccessToken() / getRefreshToken() du vrai client.ts.
 * Aucune valeur cryptographique — chaînes opaques uniquement.
 */
export const MOCK_TOKENS = {
  access: "mock_access_token_etienne_dev_only",
  refresh: "mock_refresh_token_etienne_dev_only",
};

/**
 * Simule une latence réseau légère pour rendre la preview réaliste.
 * Sans ça, les transitions login → dashboard sont instantanées et trompeuses
 * (on rate les états loading).
 */
export function mockDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
