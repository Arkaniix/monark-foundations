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

const MS_PER_DAY = 86_400_000;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function daysSinceISO(iso: string): number | undefined {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return undefined;
  return Math.max(0, Math.floor((Date.now() - t) / MS_PER_DAY));
}

type EstimatorFormProps = {
  initial?: Partial<EstimatorInputs>;
  disabled?: boolean;
  onSubmit: (inputs: EstimatorInputs) => void;
  onModeChange?: () => void;
  feesPctByPlatform?: Partial<Record<Platform, number>>;
};

export default function EstimatorForm({
  initial,
  disabled = false,
  onSubmit,
  onModeChange,
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
  const [listingDate, setListingDate] = useState<string>(() =>
    typeof initial?.listing_age_days === "number"
      ? isoDaysAgo(initial.listing_age_days)
      : "",
  );
  const [acquisitionCost, setAcquisitionCost] = useState<string>(
    typeof initial?.acquisition_cost === "number"
      ? String(initial.acquisition_cost)
      : "",
  );
  const [feesOpen, setFeesOpen] = useState<boolean>(false);
  const [feeOverrides, setFeeOverrides] = useState<Record<Platform, string>>(() =>
    PLATFORMS.reduce(
      (acc, p) => {
        acc[p] = String(PLATFORM_FEES_PCT[p]);
        return acc;
      },
      {} as Record<Platform, string>,
    ),
  );

  // Pré-remplissage (re-load depuis l'historique) : retrouve le modèle dans le catalogue.
  useEffect(() => {
    if (!initial?.model && initial?.component == null) return;
    let cancelled = false;
    const norm = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    catalogApi
      .getAllModels()
      .then((all) => {
        if (!cancelled) {
          const byId =
            initial?.component != null
              ? all.find((x) => String(x.id) === String(initial.component))
              : undefined;
          const exact = initial?.model
            ? all.find((x) => x.name === initial.model)
            : undefined;
          const fuzzy = initial?.model
            ? all.find((x) => norm(x.name) === norm(initial.model!))
            : undefined;
          const m = byId ?? exact ?? fuzzy;
          if (m) setSelectedModel(m);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initial?.model, initial?.component]);

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
    const parsedAge =
      listingDate.trim() === "" ? undefined : daysSinceISO(listingDate);
    const feeOv: Partial<Record<Platform, number>> = {};
    for (const p of PLATFORMS) {
      const v = Number.parseFloat(feeOverrides[p]);
      if (Number.isFinite(v) && v >= 0 && v !== PLATFORM_FEES_PCT[p]) {
        feeOv[p] = v;
      }
    }
    onSubmit({
      model: modelName,
      state,
      ask_price_eur: askPrice,
      platform,
      flow: "buy",
      ...(typeof parsedAge === "number" && Number.isFinite(parsedAge) && parsedAge >= 0
        ? { listing_age_days: parsedAge }
        : {}),
      ...(Object.keys(feeOv).length > 0 ? { fee_overrides: feeOv } : {}),
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
                onClick={() => {
                  if (f.value === flow) return;
                  setFlow(f.value);
                  onModeChange?.();
                }}
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
          <ModelPicker value={selectedModel} onChange={setSelectedModel} showMedian={false} />
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
        <Field label="Date de mise en ligne">
          <input
            type="date"
            max={todayISO()}
            value={listingDate}
            disabled={disabled}
            onChange={(e) => setListingDate(e.target.value)}
            className="font-mono w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2.5 text-[14px] [color-scheme:dark] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors disabled:opacity-50"
          />
          <div className="font-mono text-[10px] text-zinc-600 mt-1.5">
            {listingDate
              ? `en ligne depuis ${daysSinceISO(listingDate) ?? 0} j · affine la négociation`
              : "optionnel · affine la marge de négociation"}
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

        {flow === "buy" && (
          <div>
            <button
              type="button"
              onClick={() => setFeesOpen((v) => !v)}
              className="flex w-full items-center justify-between font-mono text-[10px] tracking-wider text-zinc-500 hover:text-zinc-300 ease-expo transition-colors"
            >
              <span>FRAIS DE REVENTE (AVANCÉ)</span>
              <span className="text-zinc-600">{feesOpen ? "−" : "+"}</span>
            </button>
            {feesOpen && (
              <div className="mt-3 flex flex-col gap-2">
                {PLATFORMS.map((p) => (
                  <div key={p} className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-zinc-400 w-16">{p}</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        inputMode="decimal"
                        value={feeOverrides[p]}
                        disabled={disabled}
                        onChange={(e) =>
                          setFeeOverrides((prev) => ({ ...prev, [p]: e.target.value }))
                        }
                        className="font-mono w-full bg-zinc-950 border border-white/10 rounded-md pl-3 pr-7 py-2 text-[13px] focus:outline-none focus:border-blue-500/60 ease-expo transition-colors disabled:opacity-50"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-zinc-600">
                        %
                      </span>
                    </div>
                  </div>
                ))}
                <div className="font-mono text-[10px] text-zinc-600 mt-0.5">
                  Tes frais vendeur réels par plateforme — recalcule marges et verdict.
                </div>
              </div>
            )}
          </div>
        )}

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