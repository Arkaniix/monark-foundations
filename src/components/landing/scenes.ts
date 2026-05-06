export type Scene = {
  key: string;
  platformLabel: string;
  domain: string;
  bg: string;
  accent: string;
  title: string;
  sellerLine: string;
  locDate: string;
  pictKey: string;
  pills: string[];
  desc: string;
  cta: string;
  price: string;
  priceShipping?: string;
  verdict: { text: string; color: string; crystal: string };
  fairPrice: string;
  delta: string;
  deltaPos: boolean;
  margin: string;
  liquidity: number;
  comps: string;
  spark: number[];
  sparkColor: string;
  modifiers: [string, number][];
};

export const HERO_SCENES: Scene[] = [
  {
    key: "lbc",
    platformLabel: "l*boncoin.fr",
    domain: "l*boncoin.fr/ad/informatique/_id_29844",
    bg: "from-orange-500/10 to-transparent",
    accent: "#F59E0B",
    title: "Carte graphique RTX 4070 Ti SUPER 16Go - Comme neuve",
    sellerLine: "Mike_T. · Particulier · 47 annonces · Membre depuis 2021",
    locDate: "Villeurbanne (69100) · Aujourd'hui, 11h08",
    pictKey: "GPU",
    pills: ["16 Go GDDR6X", "PCIe 4.0", "285 W", "3× DisplayPort"],
    desc: "Vends ma carte achetée en mars 2024. Boîte, facture et accessoires d'origine. Aucun coil whine, jamais overclockée…",
    cta: "Contacter",
    price: "720 €",
    verdict: { text: "NÉGOCIER", color: "#F59E0B", crystal: "#F59E0B" },
    fairPrice: "642 €",
    delta: "+12 % vs fair",
    deltaPos: false,
    margin: "+18 €",
    liquidity: 0.74,
    comps: "412 comparables · LBC + eBay · 180j",
    spark: [12,11,12,13,12,13,14,13,14,15,14,15,16,15,16,17,16,16,17,16,15,16,15,15,14,15,16,15,16,17],
    sparkColor: "#10B981",
    modifiers: [["trend", +6], ["liq", +3], ["value", -2]],
  },
  {
    key: "vinted",
    platformLabel: "vint*d",
    domain: "vint*d.fr/items/29401773-ryzen-7-7800x3d",
    bg: "from-emerald-500/10 to-transparent",
    accent: "#10B981",
    title: "AMD Ryzen 7 7800X3D - Excellent état",
    sellerLine: "pseudo7843 · ⭐ 4.9 (124 avis)",
    locDate: "France · Il y a 2 heures",
    pictKey: "CPU",
    pills: ["8 cores", "16 threads", "4.2 GHz", "AM5"],
    desc: "Processeur acheté il y a 6 mois, monté pendant 2 mois puis remplacé. État neuf, boîte d'origine présente…",
    cta: "Acheter",
    price: "339 €",
    verdict: { text: "FONCER", color: "#10B981", crystal: "#10B981" },
    fairPrice: "382 €",
    delta: "-11 % vs fair",
    deltaPos: true,
    margin: "+24 €",
    liquidity: 0.81,
    comps: "287 comparables · Vinted + LBC · 90j",
    spark: [22,21,22,21,20,21,20,20,19,20,19,18,19,18,18,17,18,17,17,16,17,16,16,15,16,15,15,14,15,14],
    sparkColor: "#EF4444",
    modifiers: [["trend", -4], ["liq", +5], ["value", +3]],
  },
  {
    key: "ebay",
    platformLabel: "*bay",
    domain: "*bay.fr/itm/2204881-ryzen-7-7800x3d",
    bg: "from-violet-500/10 to-transparent",
    accent: "#8B5CF6",
    title: "AMD Ryzen 7 7800X3D Boxed - Garantie restante",
    sellerLine: "tech_seller_de · 4.8 ★ · 1 248 avis",
    locDate: "Allemagne · Il y a 4 heures",
    pictKey: "HDD",
    pills: ["8 cores", "Boxed", "Garantie 2 ans", "AM5"],
    desc: "Processeur en parfait état, garantie constructeur jusqu'en 2026. Envoi rapide depuis l'Allemagne…",
    cta: "Faire une offre",
    price: "352 €",
    priceShipping: "+ 12,90 € livraison",
    verdict: { text: "TENTER AU CULOT", color: "#8B5CF6", crystal: "#8B5CF6" },
    fairPrice: "382 €",
    delta: "-8 % vs fair",
    deltaPos: true,
    margin: "+9 €",
    liquidity: 0.62,
    comps: "412 comparables · eBay + LBC · 180j",
    spark: [18,18,19,18,19,18,19,19,20,19,18,19,18,17,18,17,17,16,17,17,16,17,16,16,15,16,15,15,14,15],
    sparkColor: "#EF4444",
    modifiers: [["trend", -3], ["liq", +1], ["value", +2]],
  },
];