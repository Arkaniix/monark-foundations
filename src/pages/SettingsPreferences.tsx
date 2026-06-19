import type { CSSProperties } from "react";
import SettingsBreadcrumb from "@/components/settings/SettingsBreadcrumb";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsRow from "@/components/settings/SettingsRow";
import SettingsSegmented from "@/components/settings/SettingsSegmented";
import DropdownSelect, {
  type DropdownItem,
} from "@/components/stock/DropdownSelect";
import {
  useUiSettings,
  type StartScreen,
  type UiDensity,
  type NumberFormat,
  type MotionPreference,
} from "@/lib/useUiSettings";

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.015)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: "4px 16px",
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.20em",
  color: "#52525B",
  marginBottom: 10,
};

const START_SCREEN_OPTIONS: DropdownItem<StartScreen>[] = [
  { type: "option", value: "dashboard", label: "Dashboard" },
  { type: "option", value: "estimator", label: "Estimateur" },
  { type: "option", value: "catalogue", label: "Catalogue" },
  { type: "option", value: "watchlist", label: "Watchlist" },
  { type: "option", value: "stock", label: "Inventaire" },
];

const START_SCREEN_LABELS: Record<StartScreen, string> = {
  dashboard: "Dashboard",
  estimator: "Estimateur",
  catalogue: "Catalogue",
  watchlist: "Watchlist",
  stock: "Inventaire",
};

export default function SettingsPreferences() {
  const {
    settings,
    setDensity,
    setNumberFormat,
    setMotion,
    setStartScreen,
  } = useUiSettings();

  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel="PRÉFÉRENCES"
      />
      <SettingsHeader
        sectionLabel="§ 02 — PRÉFÉRENCES"
        title="Interface, densité et formats"
        marginBottom={24}
      />

      {/* § 02.1 NAVIGATION */}
      <div>
        <div style={sectionLabelStyle}>§ 02.1 — NAVIGATION</div>
        <div style={cardStyle}>
          <SettingsRow
            isFirst
            label="Premier écran après connexion"
            sublabel="L'application ouvre directement sur cet écran à chaque connexion"
          >
            <DropdownSelect<StartScreen>
              value={settings.startScreen}
              label={START_SCREEN_LABELS[settings.startScreen]}
              items={START_SCREEN_OPTIONS}
              onChange={setStartScreen}
              minWidth={180}
            />
          </SettingsRow>
        </div>
      </div>

      {/* § 02.2 AFFICHAGE */}
      <div>
        <div style={sectionLabelStyle}>§ 02.2 — AFFICHAGE</div>
        <div style={cardStyle}>
          <SettingsRow
            isFirst
            label="Densité d'affichage"
            sublabel="Compact réduit l'espace entre les éléments des tableaux et des cartes"
            status="soon"
          >
            <SettingsSegmented<UiDensity>
              ariaLabel="Densité d'affichage"
              value={settings.density}
              onChange={setDensity}
              disabled
              options={[
                { value: "comfortable", label: "Confortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </SettingsRow>
          <SettingsRow
            label="Format des nombres et des prix"
            sublabel="Détermine le séparateur de milliers et le séparateur décimal"
            status="soon"
          >
            <SettingsSegmented<NumberFormat>
              ariaLabel="Format des nombres"
              value={settings.numberFormat}
              onChange={setNumberFormat}
              disabled
              options={[
                { value: "fr-FR", label: "Français", sublabel: "1 234,56 €" },
                { value: "en-US", label: "Anglais", sublabel: "1,234.56 €" },
              ]}
            />
          </SettingsRow>
        </div>
      </div>

      {/* § 02.3 ACCESSIBILITÉ */}
      <div>
        <div style={sectionLabelStyle}>§ 02.3 — ACCESSIBILITÉ</div>
        <div style={cardStyle}>
          <SettingsRow
            isFirst
            label="Animations et transitions"
            sublabel="Auto suit la préférence système (prefers-reduced-motion). Réduit désactive les transitions non-essentielles."
          >
            <SettingsSegmented<MotionPreference>
              ariaLabel="Animations"
              value={settings.motion}
              onChange={setMotion}
              options={[
                { value: "auto", label: "Auto" },
                { value: "reduced", label: "Réduit" },
                { value: "full", label: "Complet" },
              ]}
            />
          </SettingsRow>
        </div>
      </div>
    </div>
  );
}