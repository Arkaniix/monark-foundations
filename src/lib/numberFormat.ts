import type { NumberFormat } from "./useUiSettings";

// Locale de formatage des NOMBRES/PRIX courante (pilotée par le réglage
// « Format des nombres et des prix »). Lue au boot depuis localStorage par
// __root, et au changement par la page Préférences (qui recharge ensuite).
// N'affecte PAS le formatage des dates (Intl.DateTimeFormat reste fr-FR).
let currentLocale: NumberFormat = "fr-FR";

export function setNumberLocale(fmt: NumberFormat): void {
  currentLocale = fmt;
}

export function getNumberLocale(): NumberFormat {
  return currentLocale;
}
