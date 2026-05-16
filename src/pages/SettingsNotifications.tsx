import type { CSSProperties } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  useNotificationsSettings,
  type NotificationFrequency,
} from "@/lib/useNotificationsSettings";
import SettingsBreadcrumb from "@/components/settings/SettingsBreadcrumb";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsRow from "@/components/settings/SettingsRow";
import SettingsToggle from "@/components/settings/SettingsToggle";
import SettingsSegmented from "@/components/settings/SettingsSegmented";

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

const v2BadgeStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  letterSpacing: "0.12em",
  padding: "1px 6px",
  background: "rgba(245,158,11,0.10)",
  color: "#F59E0B",
  borderRadius: 3,
  marginLeft: 8,
  display: "inline-block",
  verticalAlign: "middle",
};

const bannerStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  padding: "14px 16px",
  background: "rgba(59,130,246,0.06)",
  border: "1px solid rgba(59,130,246,0.20)",
  borderRadius: 8,
};

export default function SettingsNotifications() {
  const { user } = useAuth();
  const { settings, updateChannel, updateEvent, setFrequency } =
    useNotificationsSettings();

  const emailLabel = user?.email
    ? `Envoyées sur ${user.email}`
    : "Envoyées sur votre adresse de compte";

  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel="NOTIFICATIONS"
      />
      <SettingsHeader
        sectionLabel="§ 04 — NOTIFICATIONS"
        title="Canaux, événements et cadence"
        marginBottom={8}
      />

      {/* Bandeau d'info global */}
      <div style={bannerStyle}>
        <i
          className="ti ti-info-circle"
          style={{ fontSize: 18, color: "#3B82F6", lineHeight: 1.3, flexShrink: 0 }}
          aria-hidden="true"
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#93C5FD",
              letterSpacing: "0.02em",
              marginBottom: 4,
            }}
          >
            Aperçu de la fonctionnalité · Activation à venir
          </div>
          <div style={{ fontSize: 12, color: "#A1A1AA", lineHeight: 1.5 }}>
            Les préférences saisies ici sont enregistrées localement et seront
            automatiquement appliquées dès l'activation du service de notifications.
            En attendant, aucun email ni alerte in-app n'est émis.
          </div>
        </div>
      </div>

      {/* § 04.1 CANAUX */}
      <div>
        <div style={sectionLabelStyle}>§ 04.1 — CANAUX DE LIVRAISON</div>
        <div style={cardStyle}>
          <SettingsRow
            isFirst
            label="Notifications par email"
            sublabel={emailLabel}
          >
            <SettingsToggle
              ariaLabel="Notifications par email"
              checked={settings.channels.email}
              onChange={(v) => updateChannel("email", v)}
            />
          </SettingsRow>
          <SettingsRow
            label="Notifications in-app"
            sublabel="Affichées via une cloche dans le bandeau supérieur, lors de votre prochaine session active"
          >
            <SettingsToggle
              ariaLabel="Notifications in-app"
              checked={settings.channels.in_app}
              onChange={(v) => updateChannel("in_app", v)}
            />
          </SettingsRow>
        </div>
      </div>

      {/* § 04.2 ÉVÉNEMENTS */}
      <div>
        <div style={sectionLabelStyle}>§ 04.2 — TYPES D'ÉVÉNEMENTS</div>
        <p
          style={{
            fontSize: 12,
            color: "#A1A1AA",
            marginBottom: 12,
            marginTop: 0,
            lineHeight: 1.5,
          }}
        >
          Choisissez les événements qui déclencheront une notification. Les alertes
          prix sont basées sur les target_price configurés item par item.
        </p>
        <div style={cardStyle}>
          <SettingsRow
            isFirst
            label="Alertes prix Watchlist"
            sublabel="Un item de votre watchlist atteint ou descend sous son prix cible"
            footerAction={{ label: "→ Gérer mes items Watchlist", href: "/watchlist" }}
          >
            <SettingsToggle
              ariaLabel="Alertes prix Watchlist"
              checked={settings.events.watchlist_price_alerts}
              onChange={(v) => updateEvent("watchlist_price_alerts", v)}
            />
          </SettingsRow>
          <SettingsRow
            label="Alertes prix Catalogue"
            sublabel="Un modèle de vos favoris catalogue atteint le prix cible défini"
            footerAction={{ label: "→ Gérer mes favoris catalogue", href: "/catalogue" }}
          >
            <SettingsToggle
              ariaLabel="Alertes prix Catalogue"
              checked={settings.events.catalog_price_alerts}
              onChange={(v) => updateEvent("catalog_price_alerts", v)}
            />
          </SettingsRow>
          <SettingsRow
            label="Nouvelles opportunités marché"
            sublabel="Items détectés comme sous-évalués selon votre profil de revendeur"
            labelBadge={<span style={v2BadgeStyle}>V2</span>}
          >
            <SettingsToggle
              ariaLabel="Opportunités marché"
              checked={settings.events.market_opportunities}
              onChange={(v) => updateEvent("market_opportunities", v)}
            />
          </SettingsRow>
          <SettingsRow
            label="Récapitulatif hebdomadaire"
            sublabel="Synthèse chaque lundi : performance du stock, évolution de la watchlist, estimations effectuées"
          >
            <SettingsToggle
              ariaLabel="Récapitulatif hebdomadaire"
              checked={settings.events.weekly_summary}
              onChange={(v) => updateEvent("weekly_summary", v)}
            />
          </SettingsRow>
        </div>
      </div>

      {/* § 04.3 CADENCE */}
      <div>
        <div style={sectionLabelStyle}>§ 04.3 — CADENCE DES EMAILS</div>
        <div style={cardStyle}>
          <SettingsRow
            isFirst
            label="Cadence des emails"
            sublabel="Regroupe ou non les notifications avant envoi par email. N'affecte pas les notifications in-app."
          >
            <SettingsSegmented<NotificationFrequency>
              ariaLabel="Cadence des emails"
              value={settings.frequency}
              onChange={setFrequency}
              options={[
                { value: "instant", label: "Instantané", sublabel: "Un par événement" },
                { value: "daily", label: "Quotidien", sublabel: "Regroupé chaque jour" },
                { value: "weekly", label: "Hebdo", sublabel: "Regroupé chaque lundi" },
              ]}
            />
          </SettingsRow>
        </div>
      </div>
    </div>
  );
}
