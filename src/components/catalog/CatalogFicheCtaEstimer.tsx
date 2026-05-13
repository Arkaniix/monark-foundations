import { Calculator } from "lucide-react";
import SectionLabel from "../ui/SectionLabel";

type Props = {
  modelName: string;
  onEstimate: () => void;
};

export default function CatalogFicheCtaEstimer({ modelName, onEstimate }: Props) {
  return (
    <section className="flex flex-col gap-3.5">
      <SectionLabel idx={6} label="ESTIMER UNE ANNONCE" />
      <div
        className="flex items-center justify-between gap-5 rounded-xl p-5"
        style={{
          background: "rgba(59,130,246,0.04)",
          border: "0.5px solid rgba(59,130,246,0.25)",
        }}
      >
        <div>
          <div className="mb-1 text-[14px] font-medium text-zinc-100">
            Une annonce {modelName} en vue ?
          </div>
          <div className="text-[11.5px] leading-relaxed text-zinc-400">
            Évalue sa rentabilité reseller en 30s. Verdict, négo, plateformes, timing — tout en un seul shot.
          </div>
        </div>
        <button
          type="button"
          onClick={onEstimate}
          className="ease-expo flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 font-mono text-[11px] font-medium tracking-[0.12em] transition-colors hover:bg-blue-500/30"
          style={{
            background: "rgba(59,130,246,0.18)",
            border: "0.5px solid rgba(59,130,246,0.5)",
            color: "#60A5FA",
          }}
        >
          <Calculator size={13} strokeWidth={1.75} />
          ESTIMER CETTE {modelName.toUpperCase()} →
        </button>
      </div>
    </section>
  );
}