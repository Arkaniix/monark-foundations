/**
 * Glossaire central des termes Monark utilisés dans les tooltips
 * pédagogiques (fiche modèle + estimator).
 */

export type GlossaryEntry = {
  title: string;
  body: string;
  example?: string;
};

export const GLOSSARY = {
  score: {
    title: "Score Monark · 0–100",
    body: "Indicateur composite mesurant l'opportunité reseller. Combine la tendance des prix, la liquidité du marché et la marge potentielle estimée.",
    example: "Score 78 = excellent. 60–75 = bon. 40–60 = correct. Sous 40 = à éviter.",
  },
  median30d: {
    title: "Médiane 30 jours",
    body: "Prix central observé sur l'ensemble des ventes sold des 30 derniers jours, toutes plateformes confondues. Moins sensible aux extrêmes qu'une moyenne.",
  },
  medianActives30d: {
    title: "Prix médian · annonces actives 30 j",
    body: "Médiane des prix demandés sur les annonces actives observées sur cette plateforme sur 30 jours. La médiane est plus robuste que la moyenne, qui peut être tirée vers le haut par quelques annonces aux prix très éloignés du marché réel.",
  },
  trend30d: {
    title: "Tendance 30 jours",
    body: "Variation du prix médian par rapport à il y a 30 jours. Positive = le marché monte, négative = il baisse.",
    example: "+3.8% signifie que le prix médian est 3.8% plus haut qu'il y a un mois.",
  },
  liquidity: {
    title: "Liquidité",
    body: "% des annonces qui trouvent acheteur en moins de 30 jours. Plus élevé = vente rapide, marché actif.",
    example: "84% = la grande majorité des annonces se vendent sous 30 jours.",
  },
  marginPotential: {
    title: "Marge potentielle",
    body: "Estimation du % de marge brute moyen entre prix d'achat et prix de revente, après frais de plateforme. Indicatif, basé sur les patterns observés.",
  },
  observations: {
    title: "Observations (n_obs)",
    body: "Nombre de transactions sold observées sur la période. Plus le nombre est élevé, plus la statistique est fiable.",
  },
  percentileChart: {
    title: "Dispersion des prix sold",
    body: "Distribution des prix de ventes observés. La zone dense au centre correspond aux prix les plus fréquents. Les extrêmes signalent deals ou prix au-dessus du marché.",
  },
  zoneTypique: {
    title: "Zone typique · P25 → P75",
    body: "Fourchette dans laquelle se concentrent 50% des ventes observées. La « zone normale » de prix.",
    example: "Si 669€ → 771€, c'est dans cette plage que la plupart des annonces trouvent preneur.",
  },
  fourchette: {
    title: "Fourchette P10 → P90",
    body: "Plage qui contient 80% des ventes. Les 10% les plus bas (P10) et les 10% les plus hauts (P90) sont exclus.",
  },
  iqr: {
    title: "IQR · Écart interquartile",
    body: "Différence entre P75 et P25. Mesure la dispersion centrale du marché. Plus c'est faible, plus les prix sont stables et prévisibles.",
  },
  p50: {
    title: "Médiane · P50",
    body: "Le prix qui partage le marché en deux : 50% des ventes sont en dessous, 50% au-dessus.",
  },
  variantCourant: {
    title: "Variant courant",
    body: "Le modèle actuellement consulté. La table §03 liste tous les variants de la même famille pour permettre comparaison rapide.",
  },
  partVolume: {
    title: "Part de volume",
    body: "% des ventes observées sur cette plateforme par rapport au total toutes plateformes. Reflète où les acheteurs cherchent et où les vendeurs listent.",
    example: "50% sur LBC = la moitié des ventes de ce modèle se font sur Leboncoin.",
  },
  spreadGlobal: {
    title: "Spread vs global",
    body: "Écart de prix médian entre cette plateforme et la médiane globale toutes plateformes. Positif = la plateforme vend plus cher que la moyenne.",
  },
  deltaMoisPrec: {
    title: "Variation mensuelle · Δ M-1",
    body: "Différence en % du prix médian par rapport au mois précédent.",
  },
  pic: {
    title: "Pic local",
    body: "Mois où le prix médian était plus haut que les mois adjacents. Signale un sommet de prix.",
  },
  plancher: {
    title: "Plancher local",
    body: "Mois où le prix médian était plus bas que les mois adjacents. Souvent une opportunité d'achat rétrospective.",
  },
  verdict: {
    title: "Verdict reseller",
    body: "Recommandation d'action basée sur le score du modèle, la position du prix demandé dans la distribution, et la dynamique du marché.",
    example: "FONCER · NÉGOCIER · TENTER AU CULOT · PASSER",
  },
  verdictFoncer: {
    title: "FONCER",
    body: "Le deal est très bon. Achète sans hésiter. Négocie pour gratter encore mais n'attends pas — l'annonce ne durera pas.",
  },
  verdictNegocier: {
    title: "NÉGOCIER",
    body: "Prix correct mais marge à gratter. Une offre légèrement plus basse a de bonnes chances d'aboutir.",
  },
  verdictTenter: {
    title: "TENTER AU CULOT",
    body: "Prix élevé mais une offre lowball ne coûte rien. Pas de risque à demander un gros rabais.",
  },
  verdictPasser: {
    title: "PASSER",
    body: "Prix demandé trop haut, marge insuffisante même avec négociation. Mieux vaut attendre une meilleure annonce.",
  },
  plafond: {
    title: "Plafond",
    body: "Prix maximum auquel l'opération reste rentable. Au-delà, marge négative quasi-garantie après frais et temps de revente.",
  },
  optimal: {
    title: "Prix optimal",
    body: "Le sweet spot : marge confortable + bonne probabilité que le vendeur accepte. L'objectif à viser en négociation.",
  },
  plancherEstimator: {
    title: "Plancher",
    body: "Lowball acceptable. En dessous, le vendeur refusera presque certainement. Plafond de l'agressivité d'une première offre.",
  },
  offreLowball: {
    title: "Offre lowball",
    body: "Première offre agressive, souvent 20–30% sous le prix demandé. Probabilité d'acceptation faible mais gain énorme si ça passe.",
  },
  offreNegociee: {
    title: "Offre négociée",
    body: "Offre intermédiaire, 10–15% sous le prix demandé. Bon compromis acceptation × gain.",
  },
  offreCordiale: {
    title: "Offre cordiale",
    body: "Offre raisonnable, ~5% sous le prix demandé. Bon point de départ pour une négociation polie sans braquer le vendeur.",
  },
  percentilePosition: {
    title: "Position percentile",
    body: "Où se situe le prix demandé dans la distribution des ventes sold observées.",
    example: "P25 = dans le quart le moins cher (deal). P75 = dans le quart le plus cher.",
  },
  topPick: {
    title: "TOP PICK plateforme",
    body: "Plateforme recommandée pour revendre, calculée sur prix d'achat × frais × marge nette attendue × liquidité.",
  },
  margeNette: {
    title: "Marge nette",
    body: "Bénéfice après déduction des frais de plateforme. Calculée sur la médiane plateforme estimée à la revente.",
  },
  frais: {
    title: "Frais de plateforme",
    body: "% prélevé par la plateforme sur le prix de vente. Inclut commission + service paiement quand applicable.",
    example: "LBC 12 % · Vinted 0 % · eBay 10,42 %.",
  },
  timingRapide: {
    title: "Timing rapide",
    body: "Vente sous 7–15 jours. Prix légèrement sous la médiane mais cash rapidement. Pour reseller qui rotate son stock.",
  },
  timingOptimal: {
    title: "Timing optimal",
    body: "Vente sous 15–30 jours. Prix proche de la médiane, équilibre temps × prix. La voie classique.",
  },
  timingPatient: {
    title: "Timing patient",
    body: "Vente sous 30–60 jours. Prix au-dessus de la médiane, maximise la marge. Demande patience et stock disponible.",
  },
  decoteVsNeuf: {
    title: "Décote vs neuf",
    body: "% de baisse du prix d'occasion par rapport au prix neuf actuel. Reflète la valeur conservée du modèle.",
  },
  scoreBase: {
    title: "Score base",
    body: "Composante du score liée à la marge potentielle absolue. Plus le delta entre prix d'achat et prix de revente est élevé, plus la base est haute.",
  },
  fairPrice: {
    title: "Fair · juste prix",
    body: "Le prix « juste » du modèle d'après les ventes réelles observées : ce que ça vaut vraiment aujourd'hui. C'est la référence à partir de laquelle la marge et les seuils d'achat sont calculés.",
    example: "Acheter sous le fair = potentiel de marge. Au-dessus = tu paies trop cher.",
  },
  confiance: {
    title: "Confiance · 0–100 %",
    body: "À quel point l'estimation est fiable, selon la quantité et la fraîcheur des ventes observées. Plus il y a de données récentes et propres, plus la confiance monte.",
    example: "95 % = beaucoup de ventes récentes. Sous ~60 % = peu de données, à prendre avec prudence.",
  },
  donneeEstimee: {
    title: "Donnée estimée",
    body: "Cette marge n'a pas été mesurée directement sur la plateforme : elle est déduite d'un repère proche (autre plateforme ou modèle voisin). Fiabilité plus faible qu'une donnée native — à confirmer avant de t'engager.",
  },
  ajustementNet: {
    title: "Ajustement net",
    body: "Somme des trois signaux (tendance + liquidité + décote) une fois pondérée par la confiance. Quand les données sont faibles, l'impact des signaux est réduit pour ne pas sur-réagir. C'est ce qui s'ajoute au score de base.",
  },
  fiabilite: {
    title: "Fiabilité de la vente",
    body: "Probabilité que la vente aboutisse dans le délai indiqué, à ce prix. Élevée = quasi sûr. Modérée = plausible mais pas garanti. Faible = pari.",
  },
} as const satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;