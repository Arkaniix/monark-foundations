/**
 * Nav intent transitoire pour scroll restoration intelligent entre fiches catalogue.
 *
 * Backed by sessionStorage : effacé à la fermeture du tab.
 *
 * Une seule entité gérée : le nav intent (key monark.catalog.navIntent),
 * consommé une fois. Permet de scroll vers #section-variants quand on
 * navigue d'un variant vers un autre dans la table §03.
 *
 * Note : le scroll memory par modèle a été retiré (C2.4) — on revient au
 * comportement scroll-top par défaut pour préserver la lisibilité de
 * chaque fiche découverte.
 */

const NAV_INTENT_KEY = "monark.catalog.navIntent";

export type NavIntent = "variant" | "card" | null;

function isClient(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}

export function setNavIntent(intent: NavIntent): void {
  if (!isClient()) return;
  try {
    if (intent === null) {
      window.sessionStorage.removeItem(NAV_INTENT_KEY);
    } else {
      window.sessionStorage.setItem(NAV_INTENT_KEY, intent);
    }
  } catch {
    // silent fail
  }
}

/**
 * Lit le nav intent et le supprime en même temps (consume-once pattern).
 * Évite que le scroll-to-section-3 se rejoue par erreur sur une visite suivante.
 */
export function consumeNavIntent(): NavIntent {
  if (!isClient()) return null;
  try {
    const intent = window.sessionStorage.getItem(NAV_INTENT_KEY) as NavIntent;
    if (intent) {
      window.sessionStorage.removeItem(NAV_INTENT_KEY);
    }
    return intent;
  } catch {
    return null;
  }
}
