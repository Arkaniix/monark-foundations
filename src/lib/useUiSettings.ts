import { useCallback, useEffect, useState } from "react";

export type UiDensity = "comfortable" | "compact";
export type NumberFormat = "fr-FR" | "en-US";
export type MotionPreference = "auto" | "reduced" | "full";
export type StartScreen =
  | "dashboard"
  | "estimator"
  | "catalogue"
  | "watchlist"
  | "stock";

export type UiSettings = {
  density: UiDensity;
  numberFormat: NumberFormat;
  motion: MotionPreference;
  startScreen: StartScreen;
};

export const DEFAULT_UI_SETTINGS: UiSettings = {
  density: "comfortable",
  numberFormat: "fr-FR",
  motion: "auto",
  startScreen: "dashboard",
};

const KEY = "monark.settings.ui.v1";

export function getStartScreenPath(s: StartScreen): string {
  switch (s) {
    case "dashboard":
      return "/dashboard";
    case "estimator":
      return "/estimator";
    case "catalogue":
      return "/catalogue";
    case "watchlist":
      return "/watchlist";
    case "stock":
      return "/stock";
  }
}

function isDensity(v: unknown): v is UiDensity {
  return v === "comfortable" || v === "compact";
}
function isNumberFormat(v: unknown): v is NumberFormat {
  return v === "fr-FR" || v === "en-US";
}
function isMotion(v: unknown): v is MotionPreference {
  return v === "auto" || v === "reduced" || v === "full";
}
function isStartScreen(v: unknown): v is StartScreen {
  return (
    v === "dashboard" ||
    v === "estimator" ||
    v === "catalogue" ||
    v === "watchlist" ||
    v === "stock"
  );
}

function load(): UiSettings {
  if (typeof window === "undefined") return DEFAULT_UI_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_UI_SETTINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_UI_SETTINGS;
    return {
      density: isDensity(parsed.density)
        ? parsed.density
        : DEFAULT_UI_SETTINGS.density,
      numberFormat: isNumberFormat(parsed.numberFormat)
        ? parsed.numberFormat
        : DEFAULT_UI_SETTINGS.numberFormat,
      motion: isMotion(parsed.motion)
        ? parsed.motion
        : DEFAULT_UI_SETTINGS.motion,
      startScreen: isStartScreen(parsed.startScreen)
        ? parsed.startScreen
        : DEFAULT_UI_SETTINGS.startScreen,
    };
  } catch {
    return DEFAULT_UI_SETTINGS;
  }
}

function save(s: UiSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function readStartScreenPath(): string {
  return getStartScreenPath(load().startScreen);
}

export function useUiSettings() {
  const [settings, setSettings] = useState<UiSettings>(() => load());

  useEffect(() => {
    save(settings);
  }, [settings]);

  const setDensity = useCallback(
    (d: UiDensity) => setSettings((s) => ({ ...s, density: d })),
    [],
  );
  const setNumberFormat = useCallback(
    (n: NumberFormat) => setSettings((s) => ({ ...s, numberFormat: n })),
    [],
  );
  const setMotion = useCallback(
    (m: MotionPreference) => setSettings((s) => ({ ...s, motion: m })),
    [],
  );
  const setStartScreen = useCallback(
    (sc: StartScreen) => setSettings((s) => ({ ...s, startScreen: sc })),
    [],
  );

  return { settings, setDensity, setNumberFormat, setMotion, setStartScreen };
}