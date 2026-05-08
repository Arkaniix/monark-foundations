/**
 * Page de référence visuelle pour les 5 primitives partagées (P0.2).
 * Accessible sur /_dev/ui pendant tout le projet, supprimée en fin de chantier.
 */
import { SectionLabel, Counter, Sparkline, Pill, Skeleton, EmptyState } from "../components/ui";
import { useInView } from "../hooks/useInView";
import { Inbox } from "lucide-react";

function InViewDemo() {
  const [ref, inView] = useInView(0.3);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="font-mono text-sm text-zinc-300"
    >
      {inView ? "vu" : "pas vu"}
    </div>
  );
}

function DemoBlock({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-zinc-500 text-xs uppercase tracking-widest">
        {name}
      </span>
      <div>{children}</div>
    </div>
  );
}

export default function _DevUiPreview() {
  return (
    <div className="relative z-10 min-h-screen px-8 py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-12">
        <h1 className="font-mono text-zinc-400 text-sm">
          Monark v2 — primitives demo
        </h1>

        <DemoBlock name="SectionLabel">
          <SectionLabel idx={1} label="DIAGNOSTIC" />
        </DemoBlock>

        <DemoBlock name="Counter">
          <span className="text-3xl text-zinc-100">
            <Counter value={1247} suffix=" €" />
          </span>
        </DemoBlock>

        <DemoBlock name="Sparkline">
          <Sparkline points={[12, 15, 11, 18, 22, 19, 25, 28]} color="#10B981" fill />
        </DemoBlock>

        <DemoBlock name="Pill">
          <div className="flex gap-2">
            <Pill label="FONCER" color="#10B981" />
            <Pill label="PASSER" color="#EF4444" />
          </div>
        </DemoBlock>

        <DemoBlock name="Skeleton">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton animated={false} className="h-4 w-2/3 rounded" />
          </div>
        </DemoBlock>

        <DemoBlock name="EmptyState">
          <EmptyState
            icon={Inbox}
            title="Aucune estimation pour l'instant"
            description="Lance une première estimation pour voir tes résultats apparaître ici."
            cta={{ label: "Nouvelle estimation", onClick: () => alert("→ /estimator") }}
          />
        </DemoBlock>

        <DemoBlock name="useInView">
          <div style={{ height: "60vh" }} className="flex items-end font-mono text-xs text-zinc-600">
            scroll ↓
          </div>
          <InViewDemo />
        </DemoBlock>
      </div>
    </div>
  );
}