/**
 * Mock Repair Guide API.
 *
 * Honore les signatures de src/lib/api/repair.ts. Activé par VITE_USE_MOCK_API=true.
 *
 * Stratégie de contenu (pilote) :
 *  - Les 37 symptômes des 6 catégories sont listés (hub + drill-down crédibles).
 *  - UN symptôme est enrichi à fond comme RÉFÉRENCE DE QUALITÉ : "gpu_artifacts"
 *    (guide statique complet AVEC liens causaux `outcomes`, + réponse deep réaliste).
 *  - Les autres symptômes ont un guide basique générique (suffisant pour le rendu,
 *    enrichi plus tard via re-seed backend).
 *
 * Le lien causal vit dans diagnostic_steps[].outcomes : chaque étape dit ce que
 * son résultat révèle et pointe vers une cause (points_to_cause matche un
 * common_causes[].cause → lien cliquable côté UI vers la procédure).
 */

import { mockDelay } from "./fixtures";
import {
  DEEP_DIAGNOSTIC_COST,
  REPAIR_CATEGORIES,
  type DeepDiagnosticRequest,
  type DeepDiagnosticResponse,
  type GuideContent,
  type RepairHardwareModel,
  type RepairHistoryPage,
  type RepairHistoryRead,
  type RepairOutcomeUpdate,
  type StaticGuideRead,
  type SymptomRead,
} from "../../components/repair/datasets";
import { ApiException } from "../api/client";

/* ============================================================
   CATALOGUE SYMPTÔMES (37) — aligné sur le seed backend
   ============================================================ */

export const MOCK_SYMPTOMS: SymptomRead[] = [
  // GPU (8)
  { id: 1, slug: "gpu_artifacts", category: "gpu", title: "Artefacts graphiques", description: "Pixels colorés, lignes, distorsions à l'écran", icon: "device-tv", sort_order: 1 },
  { id: 2, slug: "gpu_no_display", category: "gpu", title: "Pas d'affichage", description: "Aucune image, signal absent", icon: "device-tv-off", sort_order: 2 },
  { id: 3, slug: "gpu_crash_gaming", category: "gpu", title: "Crash / Freeze en jeu", description: "Plantage récurrent sous charge graphique", icon: "alert-triangle", sort_order: 3 },
  { id: 4, slug: "gpu_fan_failure", category: "gpu", title: "Ventilateurs HS", description: "Ne tournent plus ou bruit anormal", icon: "rotate-clockwise-2", sort_order: 4 },
  { id: 5, slug: "gpu_high_temps", category: "gpu", title: "Températures élevées", description: "Surchauffe, throttling thermique fréquent", icon: "temperature-celsius", sort_order: 5 },
  { id: 6, slug: "gpu_coil_whine", category: "gpu", title: "Coil whine", description: "Bruit aigu électrique audible", icon: "wave-sine", sort_order: 6 },
  { id: 7, slug: "gpu_no_power", category: "gpu", title: "Ne démarre pas", description: "Pas de signe de vie, aucun LED ni ventilo", icon: "plug-x", sort_order: 7 },
  { id: 8, slug: "gpu_driver_error", category: "gpu", title: "Détecté mais erreur driver", description: "Code 43, périphérique inconnu Windows", icon: "bug", sort_order: 8 },
  // CPU (6)
  { id: 9, slug: "cpu_no_boot", category: "cpu", title: "Ne boot pas", description: "Aucun démarrage, pas de POST", icon: "power", sort_order: 1 },
  { id: 10, slug: "cpu_high_temps", category: "cpu", title: "Températures très élevées", description: "Surchauffe au repos ou en charge", icon: "temperature-celsius", sort_order: 2 },
  { id: 11, slug: "cpu_throttling", category: "cpu", title: "Throttling / perf basses", description: "Fréquences bridées, performances dégradées", icon: "trending-down", sort_order: 3 },
  { id: 12, slug: "cpu_bent_pins", category: "cpu", title: "Pins tordues", description: "Broches du socket ou du CPU pliées", icon: "grip-horizontal", sort_order: 4 },
  { id: 13, slug: "cpu_instability", category: "cpu", title: "Instabilité / BSOD", description: "Écrans bleus, plantages aléatoires", icon: "alert-octagon", sort_order: 5 },
  { id: 14, slug: "cpu_not_detected", category: "cpu", title: "Non détecté par la carte mère", description: "CPU absent dans le BIOS", icon: "search-off", sort_order: 6 },
  // RAM (5)
  { id: 15, slug: "ram_memtest_errors", category: "ram", title: "BSOD / erreurs Memtest", description: "Erreurs mémoire détectées au test", icon: "alert-octagon", sort_order: 1 },
  { id: 16, slug: "ram_not_detected", category: "ram", title: "Non détectée", description: "Capacité incorrecte ou nulle", icon: "search-off", sort_order: 2 },
  { id: 17, slug: "ram_wrong_speed", category: "ram", title: "Vitesse incorrecte / pas de XMP", description: "Fréquence en deçà des specs", icon: "gauge", sort_order: 3 },
  { id: 18, slug: "ram_one_stick_dead", category: "ram", title: "Une barrette morte sur le kit", description: "Un module non reconnu", icon: "layout-grid", sort_order: 4 },
  { id: 19, slug: "ram_intermittent", category: "ram", title: "Instabilité intermittente", description: "Plantages aléatoires difficiles à reproduire", icon: "activity", sort_order: 5 },
  // SSD (5)
  { id: 20, slug: "ssd_not_detected", category: "ssd", title: "Non détecté", description: "Absent du BIOS ou de l'OS", icon: "search-off", sort_order: 1 },
  { id: 21, slug: "ssd_slow_speeds", category: "ssd", title: "Vitesses très lentes", description: "Débits en deçà des specs", icon: "trending-down", sort_order: 2 },
  { id: 22, slug: "ssd_smart_warnings", category: "ssd", title: "Alertes SMART", description: "Indicateurs de santé dégradés", icon: "alert-triangle", sort_order: 3 },
  { id: 23, slug: "ssd_data_corruption", category: "ssd", title: "Corruption de données", description: "Fichiers illisibles ou corrompus", icon: "file-x", sort_order: 4 },
  { id: 24, slug: "ssd_read_only", category: "ssd", title: "Lecture seule", description: "Écriture impossible, disque verrouillé", icon: "lock", sort_order: 5 },
  // Motherboard (7)
  { id: 25, slug: "mobo_no_post", category: "motherboard", title: "Pas de POST", description: "Aucun affichage, pas de bip", icon: "power", sort_order: 1 },
  { id: 26, slug: "mobo_dead_ports", category: "motherboard", title: "Ports USB/audio morts", description: "Connecteurs non fonctionnels", icon: "usb", sort_order: 2 },
  { id: 27, slug: "mobo_vrm_failure", category: "motherboard", title: "VRM endommagé / brûlé", description: "Étage d'alimentation HS", icon: "flame", sort_order: 3 },
  { id: 28, slug: "mobo_bios_corrupt", category: "motherboard", title: "BIOS corrompu", description: "Démarrage bloqué, BIOS illisible", icon: "file-x", sort_order: 4 },
  { id: 29, slug: "mobo_pcie_dead", category: "motherboard", title: "Slot PCIe ne détecte rien", description: "Carte d'extension non reconnue", icon: "layout-grid", sort_order: 5 },
  { id: 30, slug: "mobo_capacitor_blown", category: "motherboard", title: "Condensateurs gonflés", description: "Capacités déformées ou fuyantes", icon: "circle-dot", sort_order: 6 },
  { id: 31, slug: "mobo_cmos_battery", category: "motherboard", title: "Ne retient plus l'heure/BIOS", description: "Réglages perdus à chaque coupure", icon: "clock-x", sort_order: 7 },
  // PSU (6)
  { id: 32, slug: "psu_no_power", category: "psu", title: "Pas de courant du tout", description: "Aucune alimentation, PC mort", icon: "plug-x", sort_order: 1 },
  { id: 33, slug: "psu_random_shutdown", category: "psu", title: "Coupures aléatoires", description: "Extinctions soudaines sous charge", icon: "power", sort_order: 2 },
  { id: 34, slug: "psu_coil_whine", category: "psu", title: "Coil whine", description: "Bruit électrique aigu", icon: "wave-sine", sort_order: 3 },
  { id: 35, slug: "psu_fan_issue", category: "psu", title: "Ventilateur bruyant/mort", description: "Ventilo de l'alim défaillant", icon: "rotate-clockwise-2", sort_order: 4 },
  { id: 36, slug: "psu_wrong_voltages", category: "psu", title: "Tensions incorrectes", description: "Rails hors tolérance", icon: "activity", sort_order: 5 },
  { id: 37, slug: "psu_burning_smell", category: "psu", title: "Odeur de brûlé", description: "Signe de composant grillé", icon: "flame", sort_order: 6 },
];

/* ============================================================
   GUIDE EXEMPLAIRE — gpu_artifacts (RÉFÉRENCE QUALITÉ)
   Contient les liens causaux outcomes sur chaque étape.
   ============================================================ */

const GUIDE_GPU_ARTIFACTS: GuideContent = {
  id: 1,
  severity: "high",
  difficulty: "intermediate",
  success_rate_pct: 68,
  diagnostic_steps: [
    {
      order: 1,
      title: "Vérifier les drivers et l'état logiciel",
      description: "Avant tout démontage, on écarte la piste la plus simple : un driver corrompu peut suffire à créer des artefacts.",
      tools_needed: ["DDU (Display Driver Uninstaller)"],
      detailed_instructions: [
        "Télécharger DDU (gratuit, site officiel guru3d.com) et le dernier driver de votre carte (nvidia.com pour NVIDIA, amd.com pour AMD).",
        "Redémarrer le PC en mode sans échec (maintenir Maj en cliquant Redémarrer dans Windows).",
        "Lancer DDU, choisir votre marque de GPU, puis cliquer « Nettoyer et redémarrer ».",
        "Une fois revenu sous Windows normalement, installer le driver fraîchement téléchargé.",
        "Relancer un jeu ou une vidéo qui déclenchait les artefacts.",
      ],
      what_to_observe: "Regardez si les artefacts sont toujours là après cette réinstallation propre. S'ils ont disparu, le problème était logiciel et c'est réglé. S'ils persistent, le souci est matériel et il faut continuer le diagnostic.",
      outcomes: [
        { condition: "Les artefacts disparaissent après réinstallation propre", points_to_cause: "Drivers corrompus ou obsolètes", severity: "low" },
        { condition: "Les artefacts persistent même drivers à jour", points_to_cause: "VRAM défaillante (puce mémoire)", severity: "high" },
      ],
    },
    {
      order: 2,
      title: "Stress test thermique et surveillance de la VRAM",
      description: "On pousse la carte à pleine charge pour voir si c'est la chauffe qui déclenche les artefacts.",
      tools_needed: ["FurMark", "HWInfo64"],
      detailed_instructions: [
        "Télécharger HWInfo64 (gratuit, hwinfo.com) et l'ouvrir en cochant « Sensors-only ».",
        "Télécharger FurMark (gratuit, geeks3d.com), le lancer, choisir la résolution de votre écran et cliquer « GPU stress test ».",
        "Dans HWInfo64, repérer la ligne « GPU Memory Junction Temperature » : c'est la température de la VRAM, la valeur clé ici.",
        "Laisser tourner 10 minutes en gardant les deux fenêtres visibles côte à côte.",
      ],
      what_to_observe: "Notez à quel moment les artefacts apparaissent et quelle température VRAM est atteinte. Une VRAM saine reste sous 95 °C. Si les artefacts arrivent quand la VRAM dépasse 95 °C, la chauffe est en cause. S'ils sont là dès le début à froid, c'est plus grave (puce mémoire). Si tout le GPU chauffe (le core dépasse 83 °C), c'est un problème de refroidissement global.",
      outcomes: [
        { condition: "Artefacts apparaissent à chaud, VRAM > 95 °C", points_to_cause: "Pâte thermique sèche / pads usés", severity: "medium" },
        { condition: "Artefacts présents dès le démarrage, à froid", points_to_cause: "VRAM défaillante (puce mémoire)", severity: "high" },
        { condition: "Température GPU normale mais throttling", points_to_cause: "Alimentation insuffisante / instable", severity: "medium" },
        { condition: "Tout le GPU surchauffe (core > 83 °C), throttling thermique global", points_to_symptom: "gpu_high_temps", points_to_symptom_title: "Températures élevées", severity: "high" },
      ],
    },
    {
      order: 3,
      title: "Tester sur une autre configuration ou alimentation",
      description: "On isole la carte du reste du PC pour savoir si le souci vient bien d'elle, ou de son alimentation.",
      tools_needed: ["Multimètre (optionnel)", "Autre PC ou alimentation de test"],
      detailed_instructions: [
        "Si vous avez accès à un autre PC, y monter la carte graphique et relancer le test (jeu ou FurMark).",
        "Sinon, brancher la carte sur une autre alimentation connue comme fiable.",
        "Vérifier que les câbles d'alimentation PCIe sont bien enfoncés et qu'ils ne sont pas en « daisy-chain » (un seul câble qui se dédouble) sur une carte gourmande.",
      ],
      what_to_observe: "Si les artefacts disparaissent une fois la carte sur une autre config ou alim, le problème venait de l'alimentation d'origine, pas de la carte. S'ils suivent la carte partout, c'est bien elle (probablement la VRAM).",
      outcomes: [
        { condition: "Les artefacts disparaissent sur l'autre config", points_to_cause: "Alimentation insuffisante / instable", severity: "medium" },
        { condition: "Les artefacts persistent partout", points_to_cause: "VRAM défaillante (puce mémoire)", severity: "high" },
      ],
    },
  ],
  common_causes: [
    { cause: "VRAM défaillante (puce mémoire)", probability_pct: 45, repair_difficulty: "expert" },
    { cause: "Pâte thermique sèche / pads usés", probability_pct: 30, repair_difficulty: "intermediate" },
    { cause: "Drivers corrompus ou obsolètes", probability_pct: 15, repair_difficulty: "beginner" },
    { cause: "Alimentation insuffisante / instable", probability_pct: 10, repair_difficulty: "intermediate" },
  ],
  repair_procedures: [
    {
      cause_ref: "Drivers corrompus ou obsolètes",
      steps: [
        "Télécharger DDU sur guru3d.com et le dernier driver officiel de votre carte.",
        "Couper la connexion internet (pour éviter que Windows réinstalle un driver automatiquement).",
        "Démarrer en mode sans échec : Paramètres > Récupération > Redémarrer maintenant > Dépannage > Options avancées > Paramètres > Redémarrer, puis touche 4.",
        "Lancer DDU, sélectionner « GPU » et votre marque, cliquer « Nettoyer et redémarrer ».",
        "De retour sous Windows, installer le driver propre téléchargé à l'étape 1.",
        "Relancer un jeu ou un benchmark pour confirmer que les artefacts ont disparu.",
      ],
      materials: [],
      safety_warnings: [
        "Sauvegarder vos réglages de jeux avant si vous utilisez GeForce Experience / Adrenalin.",
      ],
      requires_pro: false,
      estimated_cost_eur: 0,
      estimated_time_min: 20,
    },
    {
      cause_ref: "Pâte thermique sèche / pads usés",
      steps: [
        "Couper l'alimentation, débrancher la carte et la poser sur une surface antistatique.",
        "Photographier la carte sous tous les angles AVANT de démonter (repère pour le remontage).",
        "Dévisser le radiateur et le shroud avec un tournevis cruciforme adapté. Débrancher délicatement le câble du ventilateur.",
        "Noter l'épaisseur et la position de chaque thermal pad (les mesurer au pied à coulisse si possible : souvent 1.5 mm sur la VRAM, 1 mm sur les VRM).",
        "Nettoyer l'ancienne pâte sur le GPU avec un chiffon microfibre et de l'alcool isopropylique 99 %.",
        "Remplacer les thermal pads usés par des neufs de MÊME épaisseur (jamais plus fins).",
        "Appliquer une noisette de pâte thermique fraîche au centre du die GPU.",
        "Remonter le radiateur en serrant les vis en croix, progressivement, sans forcer.",
        "Rebrancher le ventilateur, remonter la carte, et lancer un stress test 30 min pour valider les températures.",
      ],
      materials: [
        { name: "Pâte thermique MX-4 (ou Thermal Grizzly Kryonaut)", est_price_eur: 8 },
        { name: "Kit de thermal pads (assortiment d'épaisseurs)", est_price_eur: 12 },
        { name: "Alcool isopropylique 99 %", est_price_eur: 5 },
      ],
      safety_warnings: [
        "Toujours débrancher l'alimentation et se décharger de l'électricité statique (toucher une surface métallique reliée à la terre, ou porter un bracelet antistatique).",
        "Ne JAMAIS serrer les vis du radiateur trop fort : une pression excessive peut fissurer le die ou les puces VRAM.",
        "Utiliser des pads d'épaisseur inférieure crée un mauvais contact thermique et aggrave la chauffe.",
      ],
      requires_pro: false,
      estimated_cost_eur: 25,
      estimated_time_min: 45,
    },
    {
      cause_ref: "VRAM défaillante (puce mémoire)",
      steps: [
        "Confirmer le diagnostic : les artefacts sont présents même à froid, sur n'importe quelle configuration, et persistent après changement de pâte/pads.",
        "Identifier la puce VRAM défaillante avec un outil de test mémoire spécialisé (type MATS), ou par l'observation de la zone d'écran affectée.",
        "Le remplacement ou le « reball » de la puce nécessite une station BGA (chauffe à air chaud contrôlée), du flux, des billes de soudure et beaucoup d'expérience.",
        "Si vous n'êtes pas équipé : comparer le coût d'une prestation professionnelle (souvent 80-120 €) à la valeur de revente de la carte réparée. Au-dessus de ~50 % de la valeur, la réparation n'est généralement pas rentable.",
      ],
      materials: [
        { name: "Prestation reball/remplacement en atelier", est_price_eur: 90 },
        { name: "(Si vous êtes équipé) puce VRAM compatible", est_price_eur: 35 },
      ],
      safety_warnings: [
        "Le travail au niveau BGA peut détruire définitivement la carte en cas d'erreur de température ou de manipulation.",
        "Une carte exposée à une chauffe excessive peut voir d'autres composants se décoller.",
      ],
      requires_pro: true,
      estimated_cost_eur: 90,
      estimated_time_min: 180,
    },
    {
      cause_ref: "Alimentation insuffisante / instable",
      steps: [
        "Vérifier dans les specs constructeur le wattage recommandé pour votre GPU, et comparer à la puissance de votre alimentation.",
        "S'assurer que chaque connecteur PCIe de la carte a son propre câble dédié vers l'alimentation (pas de câble unique qui se dédouble en bout de course sur les cartes gourmandes).",
        "Vérifier que les connecteurs sont bien enfoncés jusqu'au clic.",
        "Si possible, tester avec une alimentation de qualité connue pour confirmer.",
      ],
      materials: [
        { name: "Câbles PCIe dédiés supplémentaires (si besoin)", est_price_eur: 15 },
      ],
      safety_warnings: [
        "Toujours couper et débrancher l'alimentation avant de manipuler les câbles.",
      ],
      requires_pro: false,
      estimated_cost_eur: 15,
      estimated_time_min: 30,
    },
  ],
  pro_tips: [
    "Toujours photographier le placement des pads thermiques avant démontage.",
    "Ne jamais utiliser un pad d'épaisseur inférieure — ça crée un mauvais contact thermique.",
    "Stress test 30 min après remontage pour valider avant de revendre.",
  ],
};

/* ============================================================
   GUIDE BASIQUE GÉNÉRIQUE — pour les 36 autres symptômes
   Pas de liens causaux (enrichis plus tard via re-seed backend).
   ============================================================ */

function buildBasicGuide(symptom: SymptomRead, id: number): GuideContent {
  return {
    id,
    severity: "medium",
    difficulty: "intermediate",
    success_rate_pct: 60,
    diagnostic_steps: [
      {
        order: 1,
        title: "Vérification visuelle et logicielle",
        description: `Inspecter visuellement le composant concerné par « ${symptom.title.toLowerCase()} » et vérifier l'état logiciel (drivers, firmware, BIOS) avant tout démontage.`,
        tools_needed: [],
      },
      {
        order: 2,
        title: "Test d'isolation",
        description: "Tester le composant seul ou sur une autre configuration pour confirmer que la panne vient bien de lui.",
        tools_needed: ["Configuration de test"],
      },
    ],
    common_causes: [
      { cause: "Défaillance matérielle du composant", probability_pct: 55, repair_difficulty: "advanced" },
      { cause: "Mauvais contact / connectique", probability_pct: 30, repair_difficulty: "beginner" },
      { cause: "Problème logiciel ou firmware", probability_pct: 15, repair_difficulty: "beginner" },
    ],
    repair_procedures: [
      {
        cause_ref: "Mauvais contact / connectique",
        steps: [
          "Couper l'alimentation et débrancher le composant.",
          "Nettoyer les contacts (gomme, alcool isopropylique).",
          "Reconnecter fermement et tester.",
        ],
        materials: [{ name: "Alcool isopropylique 99 %", est_price_eur: 5 }],
        estimated_cost_eur: 5,
        estimated_time_min: 20,
      },
    ],
    pro_tips: [
      "Documenter chaque étape avec des photos pour faciliter le remontage.",
      "Tester systématiquement après chaque modification avant d'aller plus loin.",
    ],
  };
}

const ENRICHED_GUIDES: Record<string, GuideContent> = {
  gpu_artifacts: GUIDE_GPU_ARTIFACTS,
};

/* ============================================================
   RÉPONSE DEEP EXEMPLAIRE — gpu_artifacts sur RTX 4070 Ti SUPER
   ============================================================ */

function buildDeepAnalysisForArtifacts(modelName: string) {
  return {
    model_specific_notes: `La ${modelName} est connue pour des problèmes d'artefacts liés à la surchauffe de la VRAM GDDR6X, qui peut atteindre 100 °C en charge soutenue. La puce mémoire située sur la face arrière de la carte est particulièrement exposée. Les modèles Founders Edition et certains AIB sont plus touchés que d'autres.`,
    known_issues: [
      "VRAM GDDR6X mal refroidie sur la face arrière de la carte",
      "Thermal pads d'usine trop épais sur certains modèles AIB",
      "Coil whine fréquent sur les exemplaires fabriqués avant Q3 2024",
    ],
    personalized_diagnostic: [
      { order: 1, title: "Monitorer la VRAM en charge avec GPU-Z", description: "Lancer un stress test de 10 minutes et observer la température VRAM en continu.", expected_result: "VRAM < 95 °C. Au-dessus, surchauffe confirmée comme cause probable." },
      { order: 2, title: "Analyser la position des artefacts à l'écran", description: "Observer si les artefacts apparaissent dans des zones définies ou sur tout l'écran.", expected_result: "Artefacts en zones régulières = puce mémoire isolable ; artefacts globaux = GPU lui-même." },
    ],
    personalized_repair: [
      {
        scenario: "Surchauffe VRAM (cause la plus probable sur ce modèle)",
        probability_pct: 60,
        steps: [
          "Démonter la carte et remplacer les thermal pads par des pads 1.5 mm de qualité (Thermalright Odyssey).",
          "Appliquer une pâte thermique haut de gamme sur le GPU.",
          "Vérifier la pression du radiateur au remontage.",
        ],
        materials: [
          { name: "Thermal pads", spec: "1.5 mm, 12.8 W/mK", est_price_eur: 15 },
          { name: "Pâte thermique", spec: "MX-6 ou Kryonaut", est_price_eur: 10 },
        ],
        difficulty: "intermediate" as const,
        estimated_time_min: 60,
        estimated_cost_eur: 25,
      },
      {
        scenario: "Puce VRAM morte (si artefacts à froid)",
        probability_pct: 40,
        steps: [
          "Confirmer via test MATS la puce défaillante.",
          "Reball ou remplacement BGA — réservé aux techniciens équipés.",
          "Sinon, évaluer une prestation pro vs la valeur de revente.",
        ],
        materials: [
          { name: "Prestation reball pro", spec: "atelier spécialisé", est_price_eur: 90 },
        ],
        difficulty: "expert" as const,
        estimated_time_min: 180,
        estimated_cost_eur: 90,
      },
    ],
    roi_estimate: {
      total_repair_cost_eur: 25,
      estimated_value_repaired_eur: 580,
      roi_pct: 2220,
      recommendation: "Réparation hautement rentable dans le scénario surchauffe. Le coût matériel (~25 €) est négligeable face à la valeur de revente. Privilégier l'achat groupé de pâte et pads pour amortir sur plusieurs cartes.",
    },
    warnings: [
      "La VRAM GDDR6X est très sensible à la pression du radiateur — trop serrer les vis peut fissurer la puce.",
      "Si les artefacts persistent après remplacement des pads, ne pas insister : la puce est probablement morte.",
    ],
    confidence: "high" as const,
  };
}

/* ============================================================
   MODÈLES HARDWARE (cascade marque → modèle)
   Dérivés du catalogue, avec marque extraite et catégorie repair lowercase.
   ============================================================ */

export const MOCK_REPAIR_MODELS: RepairHardwareModel[] = [
  { id: 101, name: "RTX 4070 SUPER", category: "gpu", brand: "NVIDIA" },
  { id: 102, name: "RTX 4070 Ti SUPER", category: "gpu", brand: "NVIDIA" },
  { id: 103, name: "RTX 4080 SUPER", category: "gpu", brand: "NVIDIA" },
  { id: 104, name: "RTX 4090", category: "gpu", brand: "NVIDIA" },
  { id: 105, name: "RTX 3090", category: "gpu", brand: "NVIDIA" },
  { id: 106, name: "RX 7800 XT", category: "gpu", brand: "AMD" },
  { id: 107, name: "RX 7900 XTX", category: "gpu", brand: "AMD" },
  { id: 108, name: "Ryzen 7 7800X3D", category: "cpu", brand: "AMD" },
  { id: 109, name: "Ryzen 5 7600", category: "cpu", brand: "AMD" },
  { id: 110, name: "Ryzen 9 7950X3D", category: "cpu", brand: "AMD" },
  { id: 111, name: "i7-13700K", category: "cpu", brand: "Intel" },
  { id: 112, name: "i9-13900K", category: "cpu", brand: "Intel" },
  { id: 113, name: "DDR5-6000 32GB", category: "ram", brand: "Corsair" },
  { id: 114, name: "DDR5-6400 64GB", category: "ram", brand: "G.Skill" },
  { id: 115, name: "990 PRO 2TB", category: "ssd", brand: "Samsung" },
  { id: 116, name: "990 PRO 4TB", category: "ssd", brand: "Samsung" },
  { id: 117, name: "B650 TOMAHAWK", category: "motherboard", brand: "MSI" },
  { id: 118, name: "X670E HERO", category: "motherboard", brand: "ASUS" },
  { id: 119, name: "RM850x", category: "psu", brand: "Corsair" },
  { id: 120, name: "HX1200", category: "psu", brand: "Corsair" },
];

/* ============================================================
   HISTORIQUE MOCK (en mémoire, mutable pendant la session)
   ============================================================ */

let mockHistory: RepairHistoryRead[] = [
  { id: 1, user_id: 1, symptom_id: 1, symptom_title: "Artefacts graphiques", symptom_category: "gpu", model_id: 102, model_name: "RTX 4070 Ti SUPER", custom_name: null, used_deep: true, credits_spent: 5, outcome: "repaired", outcome_notes: "Remplacement des thermal pads, températures OK", created_at: "2026-05-14T14:32:00Z" },
  { id: 2, user_id: 1, symptom_id: 9, symptom_title: "Ne boot pas", symptom_category: "cpu", model_id: null, model_name: null, custom_name: "i5-12400F", used_deep: false, credits_spent: 0, outcome: "pending", outcome_notes: null, created_at: "2026-05-16T09:15:00Z" },
];
let historyIdSeq = 3;

/* ============================================================
   IMPLÉMENTATIONS — signatures alignées sur api/repair.ts
   ============================================================ */

export async function getSymptoms(category?: string): Promise<SymptomRead[]> {
  await mockDelay(200);
  if (category) {
    return MOCK_SYMPTOMS.filter((s) => s.category === category).sort((a, b) => a.sort_order - b.sort_order);
  }
  return [...MOCK_SYMPTOMS].sort((a, b) => (a.category < b.category ? -1 : a.category > b.category ? 1 : a.sort_order - b.sort_order));
}

export async function getSymptomBySlug(slug: string): Promise<SymptomRead> {
  await mockDelay(150);
  const found = MOCK_SYMPTOMS.find((s) => s.slug === slug);
  if (!found) throw new ApiException(404, "Symptom not found", "NOT_FOUND");
  return found;
}

export async function getGuide(symptomSlug: string): Promise<StaticGuideRead> {
  await mockDelay(280);
  const symptom = MOCK_SYMPTOMS.find((s) => s.slug === symptomSlug);
  if (!symptom) throw new ApiException(404, "Symptom not found", "NOT_FOUND");
  const guide = ENRICHED_GUIDES[symptomSlug] ?? buildBasicGuide(symptom, symptom.id + 1000);
  return { symptom, guide };
}

export async function getModels(category?: string): Promise<RepairHardwareModel[]> {
  await mockDelay(150);
  if (category) return MOCK_REPAIR_MODELS.filter((m) => m.category === category);
  return MOCK_REPAIR_MODELS;
}

export async function postDeepDiagnostic(req: DeepDiagnosticRequest): Promise<DeepDiagnosticResponse> {
  await mockDelay(1400); // simule la latence Haiku
  if (!req.model_id && !req.custom_name) {
    throw new ApiException(400, "Provide model_id or custom_name", "BAD_REQUEST");
  }
  const symptom = MOCK_SYMPTOMS.find((s) => s.id === req.symptom_id);
  if (!symptom) throw new ApiException(404, "Symptom not found", "NOT_FOUND");

  const model = req.model_id ? MOCK_REPAIR_MODELS.find((m) => m.id === req.model_id) : null;
  const modelName = model?.name ?? req.custom_name ?? null;

  // Cache simulé : 1 chance sur 4 d'être un cache hit pour démontrer le badge
  const cached = Math.random() < 0.25;

  const deep_analysis = buildDeepAnalysisForArtifacts(modelName ?? "votre carte");

  // Enregistre dans l'historique mock
  mockHistory = [
    {
      id: historyIdSeq++,
      user_id: 1,
      symptom_id: symptom.id,
      symptom_title: symptom.title,
      symptom_category: symptom.category,
      model_id: req.model_id ?? null,
      model_name: model?.name ?? null,
      custom_name: req.custom_name ?? null,
      used_deep: true,
      credits_spent: cached ? 0 : DEEP_DIAGNOSTIC_COST,
      outcome: "pending",
      outcome_notes: null,
      created_at: new Date().toISOString(),
    },
    ...mockHistory,
  ];

  return {
    deep_analysis,
    credits_spent: cached ? 0 : DEEP_DIAGNOSTIC_COST,
    cached,
    symptom,
    model_name: modelName,
  };
}

export async function getHistory(limit = 20, offset = 0): Promise<RepairHistoryPage> {
  await mockDelay(220);
  const items = mockHistory.slice(offset, offset + limit);
  return { items, total: mockHistory.length, limit, offset };
}

export async function getHistoryDetail(historyId: number): Promise<RepairHistoryRead> {
  await mockDelay(180);
  const found = mockHistory.find((h) => h.id === historyId);
  if (!found) throw new ApiException(404, "History entry not found", "NOT_FOUND");
  return found;
}

export async function updateOutcome(historyId: number, update: RepairOutcomeUpdate): Promise<RepairHistoryRead> {
  await mockDelay(200);
  const idx = mockHistory.findIndex((h) => h.id === historyId);
  if (idx === -1) throw new ApiException(404, "History entry not found", "NOT_FOUND");
  mockHistory[idx] = { ...mockHistory[idx], outcome: update.outcome, outcome_notes: update.outcome_notes ?? null };
  return mockHistory[idx];
}
