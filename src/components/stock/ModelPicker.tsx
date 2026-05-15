import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATALOG_MODELS } from "@/components/catalog/mockData";
import type { CatalogModel } from "@/components/catalog/datasets";
import ModelImage from "@/components/catalog/ModelImage";

type Props = {
  value: CatalogModel | null;
  onChange: (next: CatalogModel | null) => void;
};

export default function ModelPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const results = useMemo(() => {
    if (!hasQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return CATALOG_MODELS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        m.family.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [trimmedQuery, hasQuery]);

  const dropdownOpen = focused && hasQuery;

  return (
    <div className="relative">
      {value && !focused ? (
        <button
          type="button"
          onClick={() => {
            setFocused(true);
            setQuery("");
          }}
          className="ease-expo flex w-full items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-white/[0.025]"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.3)",
          }}
        >
          <ModelImage category={value.category} url={value.image_url} />
          <div className="flex-1 text-left">
            <div className="text-[13px] text-zinc-100">{value.name}</div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">
              {value.category} · médiane {value.median_eur} €
            </div>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">CHANGER</span>
        </button>
      ) : (
        <div
          className="flex items-center gap-2 rounded-md px-3 py-2.5"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <Search className="h-3.5 w-3.5 text-zinc-600" strokeWidth={1.5} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setTimeout(() => setFocused(false), 150);
            }}
            placeholder="Rechercher un modèle…"
            className="flex-1 bg-transparent text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          {focused && !hasQuery && (
            <span className="font-mono text-[10px] tracking-[0.1em] text-zinc-600">
              tapez pour rechercher
            </span>
          )}
        </div>
      )}

      {dropdownOpen && (
        <div
          className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-[280px] overflow-y-auto rounded-md py-1"
          style={{
            background: "#18181B",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {results.length === 0 ? (
            <div className="px-3 py-3 text-[12px] text-zinc-500">
              Aucun modèle trouvé pour «&nbsp;{trimmedQuery}&nbsp;».
            </div>
          ) : (
            results.map((m) => (
              <button
                key={m.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(m);
                  setQuery("");
                  setFocused(false);
                }}
                className="ease-expo flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
              >
                <ModelImage category={m.category} url={m.image_url} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-zinc-200">{m.name}</div>
                  <div className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">
                    {m.category} · {m.manufacturer}
                  </div>
                </div>
                <div className="font-mono text-[12px] tabular-nums text-zinc-400">
                  {m.median_eur} €
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
