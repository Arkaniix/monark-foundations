import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import SettingsBreadcrumb from "@/components/settings/SettingsBreadcrumb";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsToggle from "@/components/settings/SettingsToggle";
import DropdownSelect from "@/components/stock/DropdownSelect";
import {
  useAccountingSettings,
} from "@/lib/useAccountingSettings";
import type {
  AccountingRegime,
  CaCompositionToggle,
} from "@/lib/useAccountingSettings";
import {
  REGIME_LABELS,
  REGIME_DESCRIPTIONS,
  COMPOSITION_LABELS,
  COMPOSITION_RECOMMENDATION,
  RECOMMENDATION_LABEL,
} from "@/components/stock/bilanCalculations";

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.015)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: 16,
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.20em",
  color: "#52525B",
  marginBottom: 10,
};

const introStyle: CSSProperties = {
  fontSize: 12,
  color: "#A1A1AA",
  marginBottom: 16,
};

const fieldLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#FAFAFA",
  marginBottom: 6,
};

const REGIMES: AccountingRegime[] = ["particulier", "micro_bic", "reel"];

export default function SettingsFiscal() {
  const { settings, updateRegime, updateComposition, updateMicroBic } =
    useAccountingSettings();

  const compositionKeys = Object.keys(
    settings.composition,
  ) as Array<keyof CaCompositionToggle>;

  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel="FISCALITÉ"
      />
      <SettingsHeader
        sectionLabel="§ 03 — FISCALITÉ"
        title="Régime, composition CA et micro-BIC"
        marginBottom={24}
      />

      {/* § 03.1 — RÉGIME FISCAL */}
      <div>
        <div style={sectionLabelStyle}>§ 03.1 — RÉGIME FISCAL</div>
        <div style={cardStyle}>
          <p style={introStyle}>
            Sélectionnez votre régime fiscal. Le calcul de l'URSSAF, de l'IR et
            des seuils TVA s'adapte en conséquence.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {REGIMES.map((r, idx) => {
              const active = settings.regime === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateRegime(r)}
                  className="ease-expo flex flex-col gap-2 rounded-lg p-4 text-left transition-colors"
                  style={{
                    background: active
                      ? "rgba(9,177,186,0.06)"
                      : "rgba(255,255,255,0.02)",
                    boxShadow: active
                      ? "inset 0 0 0 2px #09B1BA"
                      : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                    minHeight: 120,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="font-mono text-[10px] tracking-[0.18em]"
                      style={{ color: active ? "#09B1BA" : "#71717A" }}
                    >
                      OPTION {idx + 1}
                      {active ? " · ACTIF" : ""}
                    </span>
                    <span
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${active ? "#09B1BA" : "#52525B"}`,
                        background: active ? "#09B1BA" : "transparent",
                      }}
                    >
                      {active && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: "#0a0a0a" }}
                        />
                      )}
                    </span>
                  </div>
                  <div className="text-[14px] font-medium text-zinc-100">
                    {REGIME_LABELS[r]}
                  </div>
                  <div className="text-[12px] leading-relaxed text-zinc-500">
                    {REGIME_DESCRIPTIONS[r]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* § 03.2 — COMPOSITION DU CA */}
      <div>
        <div style={sectionLabelStyle}>§ 03.2 — COMPOSITION DU CA</div>
        <div style={cardStyle}>
          <p style={introStyle}>
            Sélectionnez ce que vous considérez comme partie de votre chiffre
            d'affaires déclarable. Chaque toggle inclut ou exclut une catégorie
            du calcul URSSAF et IR.
          </p>
          <div className="flex flex-col gap-1">
            {compositionKeys.map((k) => {
              const on = settings.composition[k];
              const reco = COMPOSITION_RECOMMENDATION[k];
              return (
                <div
                  key={k}
                  className="flex items-center gap-3 rounded-md px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.015)" }}
                >
                  <SettingsToggle
                    checked={on}
                    onChange={(next) => updateComposition({ [k]: next })}
                    ariaLabel={`Inclure ${COMPOSITION_LABELS[k]} dans le CA`}
                  />
                  <span
                    className="flex-1 text-[13px]"
                    style={{ color: on ? "#E4E4E7" : "#71717A" }}
                  >
                    {COMPOSITION_LABELS[k]}
                  </span>
                  <span className="w-24 text-right font-mono text-[10px] text-zinc-600">
                    {RECOMMENDATION_LABEL[reco]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* § 03.3 — PARAMÈTRES MICRO-BIC (conditionnel) */}
      {settings.regime === "micro_bic" && (
        <div>
          <div style={sectionLabelStyle}>§ 03.3 — PARAMÈTRES MICRO-BIC</div>
          <div style={cardStyle}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Versement libératoire */}
              <div>
                <div style={fieldLabelStyle}>Versement libératoire IR</div>
                <div className="flex items-center gap-3">
                  <SettingsToggle
                    checked={settings.micro_bic.versement_liberatoire}
                    onChange={(next) =>
                      updateMicroBic({ versement_liberatoire: next })
                    }
                    ariaLabel="Versement libératoire IR"
                  />
                  <span className="text-[12px] text-zinc-500">
                    IR prélevé directement à 1 % du CA. Désactivez pour basculer
                    au barème.
                  </span>
                </div>
              </div>

              {/* TMI */}
              <div>
                <div style={fieldLabelStyle}>
                  TMI (Tranche marginale d'imposition)
                </div>
                <div
                  className="mb-2 text-[11px]"
                  style={{ color: "#71717A" }}
                >
                  utilisée pour comparer l'IR au barème
                </div>
                <DropdownSelect
                  value={String(settings.micro_bic.tmi_percent)}
                  label={`${settings.micro_bic.tmi_percent}%`}
                  items={[
                    { type: "option", value: "11", label: "11%" },
                    { type: "option", value: "30", label: "30%" },
                    { type: "option", value: "41", label: "41%" },
                    { type: "option", value: "45", label: "45%" },
                  ]}
                  onChange={(v) =>
                    updateMicroBic({
                      tmi_percent: parseInt(v, 10) as 11 | 30 | 41 | 45,
                    })
                  }
                  minWidth={100}
                />
              </div>

              {/* Date début activité */}
              <div>
                <div style={fieldLabelStyle}>Date début d'activité</div>
                <input
                  type="date"
                  value={settings.micro_bic.activity_start_date}
                  onChange={(e) =>
                    updateMicroBic({ activity_start_date: e.target.value })
                  }
                  className="h-[30px] rounded-md px-3 font-mono text-[12px] text-zinc-200 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                />
              </div>

              {/* CA prévisionnel annuel */}
              <div>
                <div style={fieldLabelStyle}>CA prévisionnel annuel</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={settings.micro_bic.expected_annual_ca_eur}
                    onChange={(e) =>
                      updateMicroBic({
                        expected_annual_ca_eur:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-[30px] w-32 rounded-md px-3 font-mono text-[12px] text-zinc-200 tabular-nums focus:outline-none"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                  />
                  <span className="font-mono text-[12px] text-zinc-500">€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footnote de synchronisation */}
      <div
        className="mt-2 flex items-center justify-between rounded-md px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.18em]"
          style={{ color: "#52525B" }}
        >
          SYNCHRONISÉ AVEC LE § 05 DU BILAN
        </span>
        <Link
          to="/stock"
          className="ease-expo font-mono text-[10px] tracking-[0.18em] transition-colors"
          style={{ color: "#A1A1AA" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FAFAFA")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#A1A1AA")}
        >
          VOIR L'APPLICATION →
        </Link>
      </div>
    </div>
  );
}