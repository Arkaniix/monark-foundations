export const STEPS_LOGIN: string[] = [
  "> Vérification credentials…",
  "> Récupération profil utilisateur…",
  "> Synchronisation crédits & inventaire…",
  "> Session établie. Bienvenue.",
];

export const STEPS_SIGNUP_BY_PLAN: Record<"free" | "standard" | "pro", string[]> = {
  free: [
    "> Validation format email…",
    "> Provisioning compte Free…",
    "> Allocation 10 crédits initiaux…",
    "> Compte créé. Redirection en cours.",
  ],
  standard: [
    "> Validation format email…",
    "> Provisioning compte Standard…",
    "> Initialisation paiement (11,99 €/mois)…",
    "> Allocation 180 crédits. Redirection en cours.",
  ],
  pro: [
    "> Validation format email…",
    "> Provisioning compte Pro…",
    "> Initialisation paiement (24,99 €/mois)…",
    "> Allocation 600 crédits. Redirection en cours.",
  ],
};

// rétro-compat : certains imports existants utilisent STEPS_SIGNUP
export const STEPS_SIGNUP = STEPS_SIGNUP_BY_PLAN.free;