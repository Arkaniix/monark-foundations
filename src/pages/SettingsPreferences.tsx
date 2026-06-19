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
  persistNumberFormat,
  type StartScreen,
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
  const { settings, setMotion, setStartScreen } = useUiSettings();

  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel="PRÉFÉRENCES"
      />
      <SettingsHeader
        sectionLabel="§ 02 — PRÉFÉRENCES"
        title="Interface et formats"
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
            label="Format des nombres et des prix"
            sublabel="Détermine le séparateur de milliers et le séparateur décimal. Le changement recharge la page."
          >
            <SettingsSegmented<NumberFormat>
              ariaLabel="Format des nombres"
              value={settings.numberFormat}
              onChange={(fmt) => {
                persistNumberFormat(fmt);
                window.location.reload();
              }}
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
