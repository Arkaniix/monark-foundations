export type LensScenario = {
  label: string;
  color: string;
  glow: string;
  title: string;
  sellerLine: string;
  locDate: string;
  pictKey: string;
  pills: string[];
  desc: string;
  cta: string;
  askPrice: string;
  fair: string;
  delta: string;
  deltaPos: boolean;
  margin: string;
  liquidity: number;
  confidence: number;
  comps: string;
  spark: number[];
  sparkColor: string;
  modifiers: [string, number][];
  statusLines: string[];
  domain: string;
};

export const LENS_SCENARIOS: Record<"foncer" | "negocier" | "culot", LensScenario> = {
  foncer: {
    label: "FONCER",
    color: "#10B981",
    glow: "glow-green",
    title: "Carte mère MSI MAG B650 Tomahawk WiFi - Très bon état",
    sellerLine: "Damien_R. · Particulier · 12 annonces · Membre depuis 2023",
    locDate: "Lyon 7e (69007) · Aujourd'hui, 14h32",
    pictKey: "MOBO",
    pills: ["B650", "AM5", "DDR5", "WiFi 6E", "ATX"],
    desc: "Carte mère utilisée 8 mois sur ma config principale. Aucun défaut, BIOS à jour, boîte d'origine et accessoires complets…",
    cta: "Contacter",
    askPrice: "129 €",
    fair: "168 €",
    delta: "-23 % vs fair",
    deltaPos: true,
    margin: "+34 €",
    liquidity: 0.78,
    confidence: 92,
    comps: "287 comparables · LBC + eBay · 180j",
    spark: [16,15,16,15,16,17,16,17,16,17,18,17,17,16,17,16,17,16,17,16,17,16,17,16,17,16,17,16,17,16],
    sparkColor: "#10B981",
    modifiers: [["trend", +4], ["liq", +3], ["value", +2]],
    statusLines: [
      "Récupération comparables LBC sold (180j)... ✓ 287 obs",
      "Médiane composite calculée... ✓ 168 €",
      "Score liquidité... ✓ 0.78",
    ],
    domain: "l*boncoin.fr/ad/informatique/_id_29844",
  },
  negocier: {
    label: "NÉGOCIER",
    color: "#F59E0B",
    glow: "glow-amber",
    title: "GPU NVIDIA RTX 4070 Ti Super 16Go - Full set complet",
    sellerLine: "Particulier · 5 évaluations · Toulouse",
    locDate: "Toulouse (31000) · Hier, 18h12",
    pictKey: "GPU",
    pills: ["16 Go GDDR6X", "PCIe 4.0", "285 W", "Full set"],
    desc: "Carte achetée neuve fin 2024, utilisée 4 mois en gaming modéré. Boîte, câbles, factures, jamais OC. Vente cause upgrade…",
    cta: "Contacter",
    askPrice: "699 €",
    fair: "642 €",
    delta: "+9 % vs fair",
    deltaPos: false,
    margin: "+18 €",
    liquidity: 0.71,
    confidence: 87,
    comps: "412 comparables · eBay + LBC · 90j",
    spark: [12,13,12,13,14,13,14,13,14,15,14,15,14,15,16,15,15,16,15,16,15,16,17,16,16,17,16,17,16,17],
    sparkColor: "#10B981",
    modifiers: [["trend", +6], ["liq", +1], ["value", -2]],
    statusLines: [
      "Récupération comparables eBay sold (90j)... ✓ 412 obs",
      "Médiane composite (LBC + eBay×0.85)... ✓ 642 €",
      "Score liquidité... ✓ 0.71",
    ],
    domain: "*bay.fr/itm/2204881-rtx-4070-ti-s",
  },
  culot: {
    label: "TENTER AU CULOT",
    color: "#8B5CF6",
    glow: "glow-violet",
    title: "Kit DDR5 G.Skill Trident Z5 64 Go 6400 CL32 - Sous garantie",
    sellerLine: "Membre · 23 évaluations · Nantes",
    locDate: "France · Il y a 6 heures",
    pictKey: "RAM",
    pills: ["64 Go", "DDR5-6400", "CL32", "EXPO"],
    desc: "Kit acheté il y a 8 mois, utilisé en daily. Garantie constructeur jusqu'en 2027. Boîte et radiateurs intacts…",
    cta: "Acheter",
    askPrice: "284 €",
    fair: "212 €",
    delta: "+34 % vs fair",
    deltaPos: false,
    margin: "+9 €",
    liquidity: 0.54,
    confidence: 73,
    comps: "91 comparables · Vinted + LBC · 60j",
    spark: [16,16,15,16,15,16,15,15,14,15,14,15,14,14,13,14,13,14,13,13,12,13,12,13,12,12,11,12,11,12],
    sparkColor: "#EF4444",
    modifiers: [["trend", -3], ["liq", -1], ["value", +1]],
    statusLines: [
      "Récupération comparables Vinted sold (60j)... ✓ 91 obs",
      "Médiane composite calculée... ✓ 212 €",
      "Score liquidité... ✓ 0.54",
    ],
    domain: "vint*d.fr/items/49102_ddr5-g-skill",
  },
};

export type LensScenarioKey = keyof typeof LENS_SCENARIOS;