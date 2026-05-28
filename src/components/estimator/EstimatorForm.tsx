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

type EstimatorFormProps = {
  initial?: Partial<EstimatorInputs>;
  disabled?: boolean;
  onSubmit: (inputs: EstimatorInputs) => void;
};

export default function EstimatorForm({
  initial,
  disabled = false,
  onSubmit,
}: EstimatorFormProps) {
  const [selectedModel, setSelectedModel] = useState<CatalogModel | null>(null);
  const [state, setState] = useState<ItemState>(initial?.state ?? "Bon");
  const [askPrice, setAskPrice] = useState<number>(
    initial?.ask_price_eur ?? 265,
  );
  const [platform, setPlatform] = useState<Platform>(
    initial?.platform ?? "LBC",
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
  const creditCost =
    user?.subscription_tier === "free"
      ? 1
      : user?.subscription_tier === "pro"
        ? 5
        : 3;
  const hasEnoughCredits = (user?.credits_remaining ?? Infinity) >= creditCost;
  const canSubmit = !!modelName && askPrice > 0 && !disabled && hasEnoughCredits;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      model: modelName,
      state,
      ask_price_eur: askPrice,
      platform,
    });
  };

  return (
    <div className="mk-card p-6">
      <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-5">
        INPUT
      </div>

      <div className="space-y-5">
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
                  "py-2 rounded text-[11px] border ease-expo transition-all disabled:opacity-50 " +
                  (state === s
                    ? "border-white/30 bg-white/10 text-zinc-100"
                    : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/15")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Prix demandé (€)">
          <input
            type="number"
            value={askPrice}
            disabled={disabled}
            onChange={(e) => setAskPrice(parseFloat(e.target.value) || 0)}
            className="font-mono w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors disabled:opacity-50"
          />
        </Field>

        <Field label="Plateforme">
        <div className="grid grid-cols-3 gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => setPlatform(p)}
                className={
                  "py-2 rounded font-mono text-[11px] border ease-expo transition-all disabled:opacity-50 " +
                  (platform === p
                    ? "border-white/30 bg-white/10 text-zinc-100"
                    : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/15")
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
            ? `Évaluer · ${creditCost} crédit${creditCost > 1 ? "s" : ""}`
            : "Crédits insuffisants"}
        </button>

        <div className="font-mono text-[10px] text-zinc-600 text-center">
          Frais plateforme appliqués : {PLATFORM_FEES_PCT[platform]} %
        </div>
      </div>
    </div>
  );
}

export { EstimatorForm };