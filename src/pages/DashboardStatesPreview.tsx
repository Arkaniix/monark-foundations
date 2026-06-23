import Dashboard from "./Dashboard";

export default function DashboardStatesPreview() {
  return (
    <div className="min-h-screen bg-[var(--mk-bg)] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 font-mono text-[12px] text-amber-300/90">
          Preview obsolète — le Dashboard utilise désormais des données réelles. Rendu du Dashboard normal ci-dessous.
        </div>
        <Dashboard />
      </div>
    </div>
  );
}