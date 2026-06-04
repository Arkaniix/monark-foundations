import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { Field } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { catalogApi } from "@/lib/api";
import type { CatalogModel } from "@/components/catalog/datasets";
import ModelPicker from "@/components/stock/ModelPicker";
import {
  ITEM_STATES,
  PLATFORMS,
  PLATFORM_FEES_PCT,
  type EstimatorInputs,
  type ItemState,
  type Platform,
} from "./datasets";

const FLOWS: { value: "buy" | "sell"; label: string }[] = [
  { value: "buy", label: "Achat" },
  { value: "sell", label: "Vente" },
];

type EstimatorFormProps = {
  initial?: Partial<EstimatorInputs>;
  disabled?: boolean;
  onSubmit: (inputs: EstimatorInputs) => void;
  feesPctByPlatform?: Partial<Record<Platform, number>>;
};

export default function EstimatorForm({
  initial,
  disabled = false,
  onSubmit,
  feesPctByPlatform,
}: EstimatorFormProps) {
  const [selectedModel, setSelectedModel] = useState<CatalogModel | null>(null);
  const [flow, setFlow] = useState<"buy" | "sell">(initial?.flow ?? "buy");
  const [state, setState] = useState<ItemState>(initial?.state ?? "Bon");
  const [askPrice, setAskPrice] = useState<number>(
    initial?.ask_price_eur ?? 265,
  );
  const [platform, setPlatform] = useState<Platform>(
    initial?.platform ?? "LBC",
  );
  const [listingAgeDays, setListingAgeDays] = useState<string>(
    typeof initial?.listing_age_days === "number"
      ? String(initial.listing_age_days)
      : "",
  );
  const [acquisitionCost, setAcquisitionCost] = useState<string>(
    typeof initial?.acquisition_cost === "number"
      ? String(initial.acquisition_cost)
      : "",
  );

  // Pré-remplissage (re-load depuis l'historique) : retrouve le modèle dans le catalogue.
  useEffect(() => {
    if (!initial?.model) return;
    let cancelled = false;
    catalogApi
      .getAllModels()
      .then((all) => {
        if (!cancelled) {
          const m = all.find((x) => x.name === initial.model);
          if (m) setSelectedModel(m);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initial?.model]);

  const modelName = selectedModel?.name ?? "";

  const { user } = useAuth();
  const creditCost = flow === "sell" ? 7 : 3;
  const hasEnoughCredits = (user?.credits_remaining ?? Infinity) >= creditCost;
  const canSubmit =
    !!modelName &&
    (flow === "sell" || askPrice > 0) &&
    !disabled &&
    hasEnoughCredits;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (flow === "sell") {
      const parsedAcq =
        acquisitionCost.trim() === ""
          ? undefined
          : Number.parseFloat(acquisitionCost);
      onSubmit({
        model: modelName,
        state,
        ask_price_eur: 0,
        platform,
        flow: "sell",
        ...(typeof parsedAcq === "number" && Number.isFinite(parsedAcq) && parsedAcq >= 0
          ? { acquisition_cost: parsedAcq }
          : {}),
      });
      return;
    }
    const parsedAge = listingAgeDays.trim() === ""
      ? undefined
      : Number.parseInt(listingAgeDays, 10);
    onSubmit({
      model: modelName,
      state,
      ask_price_eur: askPrice,
      platform,
      flow: "buy",
      ...(typeof parsedAge === "number" && Number.isFinite(parsedAge) && parsedAge >= 0
        ? { listing_age_days: parsedAge }
        : {}),
    });
  };

  return (
    <div className="mk-card p-6">
      <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-5">
        INPUT
      </div>

      <div className="space-y-5">
        <Field label="Mode">
          <div className="grid grid-cols-2 gap-1.5">
            {FLOWS.map((f) => (
              <button
                key={f.value}
                type="button"
                disabled={disabled}
                onClick={() => setFlow(f.value)}
                className={
                  "chip py-2 text-[11px] text-zinc-500 disabled:opacity-50 " +
                  (flow === f.value ? "on" : "")
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Modèle">
          <ModelPicker value={selectedModel} onChange={setSelectedModel} />
        </Field>

        <Field label="État">
          <div className="grid grid-cols-5 gap-1.5">
            {ITEM_STATES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => setState(s)}
                className={
                  "chip py-2 text-[11px] text-zinc-500 disabled:opacity-50 " +
                  (state === s ? "on" : "")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {flow === "buy" && (
        <Field label="Prix demandé (€)">
          <input
            type="number"
            value={askPrice}
            disabled={disabled}
            onChange={(e) => setAskPrice(parseFloat(e.target.value) || 0)}
            className="font-mono w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors disabled:opacity-50"
          />
        </Field>
        )}

        {flow === "buy" && (
        <Field label="Âge de l'annonce (jours)">
          <input
            type="number"
            min={0}
            value={listingAgeDays}
            disabled={disabled}
            placeholder="optionnel"
            onChange={(e) => setListingAgeDays(e.target.value)}
            className="font-mono w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors disabled:opacity-50"
          />
          <div className="font-mono text-[10px] text-zinc-600 mt-1.5">
            affine la marge de négociation
          </div>
        </Field>
        )}

        {flow === "sell" && (
        <Field label="Prix d'achat (€)">
          <input
            type="number"
            min={0}
            value={acquisitionCost}
            disabled={disabled}
            placeholder="optionnel"
            onChange={(e) => setAcquisitionCost(e.target.value)}
            className="font-mono w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors disabled:opacity-50"
          />
          <div className="font-mono text-[10px] text-zinc-600 mt-1.5">
            pour calculer ton profit
          </div>
        </Field>
        )}

        <Field label="Plateforme">
        <div className="grid grid-cols-3 gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => setPlatform(p)}
                className={
                  "chip py-2 font-mono text-[11px] text-zinc-500 disabled:opacity-50 " +
                  (platform === p ? "on" : "")
                }
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-shimmer w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-blue-500 hover:bg-blue-400 text-white font-medium text-[13.5px] disabled:opacity-50 ease-expo transition-colors shadow-[0_8px_30px_-8px_rgba(59,130,246,0.6)]"
        >
          <Calculator className="w-4 h-4" />
          {hasEnoughCredits
            ? `Évaluer · ${creditCost} crédits`
            : "Crédits insuffisants"}
        </button>

      </div>
    </div>
  );
}

export { EstimatorForm };