export type SettingsCategoryKey =
  | "account"
  | "preferences"
  | "fiscal"
  | "notifications"
  | "data"
  | "about";

export type SettingsCategoryStatus = "ready" | "p2" | "soon";

export type SettingsCategoryDef = {
  key: SettingsCategoryKey;
  path: string;
  pageLabel: string;
  sectionNumber: string;
  label: string;
  sectionTitle: string;
  pageSubtitle: string;
  tileSublabel: string;
  iconName: string;
  iconColorHex: string;
  iconBgRgba: string;
  status: SettingsCategoryStatus;
  futurePatch: string;
};

export const SETTINGS_CATEGORIES: SettingsCategoryDef[] = [
  {
    key: "account",
    path: "/settings/account",
    pageLabel: "PARAMÈTRES · COMPTE",
    sectionNumber: "§ 01",
    label: "Compte",
    sectionTitle: "COMPTE",
    pageSubtitle: "Identité, plan et sécurité",
    tileSublabel: "Profil, plan, sécurité",
    iconName: "user",
    iconColorHex: "#3B82F6",
    iconBgRgba: "rgba(59,130,246,0.10)",
    status: "ready",
    futurePatch: "P1B",
  },
  {
    key: "preferences",
    path: "/settings/preferences",
    pageLabel: "PARAMÈTRES · PRÉFÉRENCES",
    sectionNumber: "§ 02",
    label: "Préférences",
    sectionTitle: "PRÉFÉRENCES",
    pageSubtitle: "Interface, densité et formats",
    tileSublabel: "Interface, densité, format",
    iconName: "sliders",
    iconColorHex: "#A1A1AA",
    iconBgRgba: "rgba(161,161,170,0.10)",
    status: "ready",
    futurePatch: "P1C",
  },
  {
    key: "fiscal",
    path: "/settings/fiscal",
    pageLabel: "PARAMÈTRES · FISCALITÉ",
    sectionNumber: "§ 03",
    label: "Fiscalité",
    sectionTitle: "FISCALITÉ",
    pageSubtitle: "Régime, composition CA et micro-BIC",
    tileSublabel: "Régime, composition CA, micro-BIC",
    iconName: "receipt",
    iconColorHex: "#F59E0B",
    iconBgRgba: "rgba(245,158,11,0.10)",
    status: "ready",
    futurePatch: "P1D",
  },
  {
    key: "notifications",
    path: "/settings/notifications",
    pageLabel: "PARAMÈTRES · NOTIFICATIONS",
    sectionNumber: "§ 04",
    label: "Notifications",
    sectionTitle: "NOTIFICATIONS",
    pageSubtitle: "Alertes prix et canaux",
    tileSublabel: "Alertes prix, canaux email",
    iconName: "bell",
    iconColorHex: "#09B1BA",
    iconBgRgba: "rgba(9,177,186,0.10)",
    status: "soon",
    futurePatch: "P1E",
  },
  {
    key: "data",
    path: "/settings/data",
    pageLabel: "PARAMÈTRES · DONNÉES",
    sectionNumber: "§ 05",
    label: "Données",
    sectionTitle: "DONNÉES",
    pageSubtitle: "Export, import et réinitialisation",
    tileSublabel: "Export, import, réinitialisation",
    iconName: "database",
    iconColorHex: "#10B981",
    iconBgRgba: "rgba(16,185,129,0.10)",
    status: "ready",
    futurePatch: "P1F",
  },
  {
    key: "about",
    path: "/settings/about",
    pageLabel: "PARAMÈTRES · À PROPOS",
    sectionNumber: "§ 06",
    label: "À propos",
    sectionTitle: "À PROPOS",
    pageSubtitle: "Version, glossaire et mentions",
    tileSublabel: "Version, glossaire, mentions",
    iconName: "info",
    iconColorHex: "#A1A1AA",
    iconBgRgba: "rgba(161,161,170,0.10)",
    status: "ready",
    futurePatch: "P1G",
  },
];

export function getSettingsCategory(
  key: SettingsCategoryKey,
): SettingsCategoryDef {
  const found = SETTINGS_CATEGORIES.find((c) => c.key === key);
  if (!found) throw new Error(`Unknown settings category: ${key}`);
  return found;
}