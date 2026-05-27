import { useEffect, useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { catalogApi } from "@/lib/api";
import type { CatalogModel } from "@/components/catalog/datasets";
import ModelImage from "@/components/catalog/ModelImage";

type Props = {
  value: CatalogModel | null;
  onChange: (next: CatalogModel | null) => void;
  onSwitchToCustom?: (initialName: string) => void;
};

export default function ModelPicker({ value, onChange, onSwitchToCustom }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [allModels, setAllModels] = useState<CatalogModel[]>([]);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getAllModels()
      .then((m) => {
        if (!cancelled) setAllModels(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const results = useMemo(() => {
    if (!hasQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return allModels
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q) ||
          m.family.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [trimmedQuery, hasQuery, allModels]);

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
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white/[0.02]">
            <ModelImage category={value.category} url={value.image_url} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-[13px] text-zinc-100">{value.name}</div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">
              {value.category} · médiane {value.median_eur} €
            </div>
          </div>
          <span className="flex-shrink-0 font-mono text-[10px] text-zinc-500">CHANGER</span>
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
          className="absolute left-0 right-0 top-full z-[110] mt-1 max-h-[280px] overflow-y-auto rounded-md py-1"
          style={{
            background: "#18181B",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {results.length === 0 ? (
            <div className="px-3 py-3">
              <div className="text-[12px] text-zinc-300">
                Aucun modèle trouvé pour «&nbsp;{trimmedQuery}&nbsp;».
              </div>
              <div className="mt-1 font-mono text-[10px] tracking-[0.06em] text-zinc-500">
                Le catalogue Monark se limite aux GPU/CPU/RAM/SSD/MOBO/PSU principaux.
              </div>
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
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white/[0.02]">
                  <ModelImage category={m.category} url={m.image_url} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-zinc-200">{m.name}</div>
                  <div className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">
                    {m.category} · {m.manufacturer}
                  </div>
                </div>
                <div className="flex-shrink-0 font-mono text-[12px] tabular-nums text-zinc-400">
                  {m.median_eur} €
                </div>
              </button>
            ))
          )}
          {onSwitchToCustom && (
            <>
              <div
                className="my-1 h-px"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSwitchToCustom(trimmedQuery);
                  setQuery("");
                  setFocused(false);
                }}
                className="ease-expo flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors"
                style={{ background: "rgba(59,130,246,0.04)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(59,130,246,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(59,130,246,0.04)")
                }
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[13px]" style={{ color: "#60A5FA" }}>
                    + Saisir un modèle non listé
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-zinc-500">
                    Pour les pièces hors-catalogue (cooling, boîtiers, câbles, etc.)
                  </div>
                </div>
                <ArrowRight
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{ color: "#60A5FA" }}
                  strokeWidth={1.5}
                />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
