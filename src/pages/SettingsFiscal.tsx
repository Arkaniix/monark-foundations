import SettingsBreadcrumb from "../components/settings/SettingsBreadcrumb";
import SettingsHeader from "../components/settings/SettingsHeader";
import SettingsPlaceholder from "../components/settings/SettingsPlaceholder";
import { getSettingsCategory } from "../components/settings/datasets";

export default function SettingsFiscal() {
  const c = getSettingsCategory("fiscal");
  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel={c.sectionTitle}
      />
      <SettingsHeader
        sectionLabel={`${c.sectionNumber} — ${c.sectionTitle}`}
        title={c.pageSubtitle}
        marginBottom={24}
      />
      <SettingsPlaceholder
        label={`Section en cours d'intégration · ${c.futurePatch}`}
      />
    </div>
  );
}
