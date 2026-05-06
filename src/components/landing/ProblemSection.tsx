import { SectionLabel } from "@/components/ui";
import ProblemViz from "./ProblemViz";

type Card = { kind: "vol" | "scams" | "under"; title: string; body: string };

export default function ProblemSection() {
  const cards: Card[] = [
    { kind: "vol", title: "Volatilité brutale", body: "Un GPU peut perdre 18 % en deux semaines après un drop driver ou un dump retail. Vos prix d'hier sont des prix d'hier." },
    { kind: "scams", title: "Densité de scams", body: "Annonces clonées, photos volées, prix planchers irréalistes : la heatmap rouge, c'est ce que vous traversez tous les jours sans filet." },
    { kind: "under", title: "Sous-cotation invisible", body: "Le bon coup, c'est l'annonce à 27 % sous la médiane composite. Sans données, vous la voyez après un autre revendeur." },
  ];
  return (
    <section className="relative py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <SectionLabel idx={1} label="DIAGNOSTIC" />
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <h2 className="text-[40px] leading-[1.05] font-semibold tracking-tight max-w-2xl">
            Le marché de l'occasion est devenu illisible.
          </h2>
          <p className="font-mono text-[12px] text-zinc-500 max-w-sm">
            Trois pathologies structurelles. Trois réponses dans Monark.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <div key={c.kind} className="mk-card p-7">
              <div className="relative">
                <div className="font-mono text-[10px] tracking-wider text-zinc-600 mb-4">PATHOLOGIE / 0{i + 1}</div>
                <div className="mb-5">
                  <ProblemViz kind={c.kind} />
                </div>
                <h3 className="text-[18px] font-semibold tracking-tight mb-2">{c.title}</h3>
                <p className="text-[13.5px] text-zinc-400 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}