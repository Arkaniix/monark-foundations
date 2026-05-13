const SCROLL_KEY_PREFIX = "monark.catalog.scroll:";
const NAV_INTENT_KEY = "monark.catalog.navIntent";

export type NavIntent = "variant" | "card" | null;

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function saveScrollPosition(modelId: string, scrollY: number): void {
  if (!isClient()) return;
  try {
    window.sessionStorage.setItem(SCROLL_KEY_PREFIX + modelId, String(scrollY));
  } catch {
    /* noop */
  }
}

export function getScrollPosition(modelId: string): number | null {
  if (!isClient()) return null;
  try {
    const raw = window.sessionStorage.getItem(SCROLL_KEY_PREFIX + modelId);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
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
    /* noop */
  }
}

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