import { SectionLabel } from "@/components/ui";
import StockManagerCard from "./StockManagerCard";
import RepairGuideCard from "./RepairGuideCard";

export default function StockRepairSection() {
  return (
    <section id="stock" className="py-24 border-t border-white/5">
      <div className="max-w-[1320px] mx-auto px-6">
        <SectionLabel idx={4} label="STACK PRODUIT · MODULES COMPLÉMENTAIRES" />
        <h2 className="text-[34px] font-semibold tracking-tight mb-10 max-w-2xl">
          Stock Manager et Repair Guide. <span className="text-zinc-500">Le revenu, et ce qui le grignote.</span>
        </h2>
        <div className="grid lg:grid-cols-2 gap-5">
          <StockManagerCard />
          <RepairGuideCard />
        </div>
      </div>
    </section>
  );
}