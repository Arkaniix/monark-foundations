// Animations d'entrée de l'app : elles ne jouent qu'à la toute première vague de composants
// montés dans la session (premier affichage), avec leur stagger. Après ça, tout composant monté
// plus tard — notamment lors des navigations entre pages — s'affiche directement, sans animation,
// pour que les changements de page soient instantanés.
let appEntranceComplete = false;
let entranceTimer: ReturnType<typeof setTimeout> | null = null;

export function isEntranceComplete(): boolean {
  return appEntranceComplete;
}

export function markEntranceCompleteSoon(): void {
  if (appEntranceComplete || entranceTimer) return;
  // Bascule au tick suivant : laisse la première vague (montée au même render) lancer son
  // animation, puis fige l'entrée comme « faite » pour tous les montages ultérieurs.
  entranceTimer = setTimeout(() => {
    appEntranceComplete = true;
  }, 0);
}