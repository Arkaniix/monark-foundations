import { useState, useEffect, useMemo, type ComponentType } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  CircuitBoard,
  Plug,
  Tv,
  TvMinimal,
  AlertTriangle,
  RotateCw,
  Thermometer,
  AudioWaveform,
  PlugZap,
  Bug,
  Power,
  TrendingDown,
  GripHorizontal,
  AlertOctagon,
  SearchX,
  Gauge,
  LayoutGrid,
  Activity,
  FileX,
  Lock,
  Usb,
  Flame,
  CircleDot,
  AlarmClockOff,
  ChevronRight,
  History as HistoryIcon,
  Wrench,
} from "lucide-react";
import { repairApi } from "@/lib/api";
import {
  REPAIR_CATEGORIES,
  type RepairCategorySlug,
  type SymptomRead,
} from "@/components/repair/datasets";

type IconCmp = ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, IconCmp> = {
  // categories
  "device-desktop": Monitor,
  "cpu": Cpu,
  "server-2": MemoryStick,
  "database": HardDrive,
  "circuit-changeover": CircuitBoard,
  "plug-connected": Plug,
  // symptoms
  "device-tv": Tv,
  "device-tv-off": TvMinimal,
  "alert-triangle": AlertTriangle,
  "rotate-clockwise-2": RotateCw,
  "temperature-celsius": Thermometer,
  "wave-sine": AudioWaveform,
  "plug-x": PlugZap,
  "bug": Bug,
  "power": Power,
  "trending-down": TrendingDown,
  "grip-horizontal": GripHorizontal,
  "alert-octagon": AlertOctagon,
  "search-off": SearchX,
  "gauge": Gauge,
  "layout-grid": LayoutGrid,
  "activity": Activity,
  "file-x": FileX,
  "lock": Lock,
  "usb": Usb,
  "flame": Flame,
  "circle-dot": CircleDot,
  "clock-x": AlarmClockOff,
};

function getIcon(slug: string | null | undefined): IconCmp {
  if (!slug) return Wrench;
  return ICON_MAP[slug] ?? Wrench;
}

export default function Repair() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<RepairCategorySlug | null>(null);
  const [allSymptoms, setAllSymptoms] = useState<SymptomRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    repairApi
      .getSymptoms()
      .then((symptoms) => {
        if (mounted) {
          setAllSymptoms(symptoms);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const countByCategory = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of allSymptoms) m[s.category] = (m[s.category] ?? 0) + 1;
    return m;
  }, [allSymptoms]);

  const categorySymptoms = useMemo(
    () =>
      allSymptoms
        .filter((s) => s.category === selectedCategory)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allSymptoms, selectedCategory],
  );

  const activeCategoryDef = selectedCategory
    ? REPAIR_CATEGORIES.find((c) => c.slug === selectedCategory)
    : null;

  return (
    <div>
      {/* Breadcrumb décoratif */}
      <div className="mb-4 font-mono text-[11px] tracking-wider">
        <span style={{ color: "#71717A" }}>MONARK FOUNDATIONS</span>
        <span style={{ color: "#52525B" }}>{"  /  "}</span>
        <span style={{ color: "#52525B" }}>REPAIR GUIDE</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
            § 01 — REPAIR GUIDE
          </div>
          <h1 className="mt-1 text-[22px] font-medium" style={{ color: "#FAFAFA" }}>
            Diagnostic et réparation de votre hardware
          </h1>
          <p className="mt-1 text-[12px]" style={{ color: "#A1A1AA" }}>
            37 symptômes documentés · Diagnostic personnalisé IA disponible · 5 crédits par analyse approfondie
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/repair_/history" })}
          className="ease-expo flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.015] px-3 py-2 font-mono text-[11px] tracking-wider transition-colors hover:border-white/[0.12] hover:bg-white/[0.03]"
          style={{ color: "#A1A1AA" }}
        >
          <HistoryIcon className="h-3 w-3" strokeWidth={1.5} />
          HISTORIQUE
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-lg"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            />
          ))}
        </div>
      ) : selectedCategory === null ? (
        <CategoryStep
          countByCategory={countByCategory}
          onSelect={setSelectedCategory}
        />
      ) : (
        <SymptomStep
          categoryLabel={activeCategoryDef?.label ?? ""}
          categoryColor={activeCategoryDef?.colorHex ?? "#A1A1AA"}
          categoryBg={activeCategoryDef?.iconBgRgba ?? activeCategoryDef?.bgRgba ?? "rgba(255,255,255,0.04)"}
          categoryIconSlug={activeCategoryDef?.icon ?? ""}
          symptoms={categorySymptoms}
          onBack={() => setSelectedCategory(null)}
          onPick={(slug) => navigate({ to: "/repair_/$slug", params: { slug } })}
        />
      )}
    </div>
  );
}

function CategoryStep({
  countByCategory,
  onSelect,
}: {
  countByCategory: Record<string, number>;
  onSelect: (slug: RepairCategorySlug) => void;
}) {
  return (
    <div>
      <div className="mb-3 font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
        § 01.1 — CHOISISSEZ UNE CATÉGORIE
      </div>
      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
        {REPAIR_CATEGORIES.map((cat) => {
          const Icon = getIcon(cat.icon);
          const count = countByCategory[cat.slug] ?? 0;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelect(cat.slug)}
              className="ease-expo group flex flex-col gap-[14px] rounded-lg p-[18px] text-left transition-colors hover:bg-white/[0.03]"
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-md"
                style={{ background: cat.bgRgba }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: cat.colorHex }} />
              </div>
              <div>
                <div className="text-[14px] font-medium" style={{ color: "#FAFAFA" }}>
                  {cat.label}
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
                  {count} SYMPTÔMES
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SymptomStep({
  categoryLabel,
  categoryColor,
  categoryBg,
  categoryIconSlug,
  symptoms,
  onBack,
  onPick,
}: {
  categoryLabel: string;
  categoryColor: string;
  categoryBg: string;
  categoryIconSlug: string;
  symptoms: SymptomRead[];
  onBack: () => void;
  onPick: (slug: string) => void;
}) {
  const CatIcon = getIcon(categoryIconSlug);
  return (
    <div>
      <div className="mb-4 font-mono text-[11px] tracking-wider">
        <button
          type="button"
          onClick={onBack}
          className="ease-expo transition-colors hover:text-zinc-100"
          style={{ color: "#A1A1AA" }}
        >
          ← CATÉGORIES
        </button>
        <span style={{ color: "#52525B" }}>{"  /  "}</span>
        <span style={{ color: "#52525B" }}>{categoryLabel.toUpperCase()}</span>
      </div>

      <div className="mb-6 flex items-center gap-[14px]">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-md"
          style={{ background: categoryBg }}
        >
          <CatIcon className="h-5 w-5" strokeWidth={1.5} style={{ color: categoryColor }} />
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
            § 01.A — {categoryLabel.toUpperCase()}
          </div>
          <div className="text-[18px] font-medium" style={{ color: "#FAFAFA" }}>
            Quel symptôme observez-vous ?
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        {symptoms.map((sym) => {
          const Icon = getIcon(sym.icon);
          return (
            <button
              key={sym.id}
              type="button"
              onClick={() => onPick(sym.slug)}
              className="ease-expo group flex items-center gap-[14px] rounded-lg px-4 py-[14px] text-left transition-colors hover:bg-white/[0.025]"
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} style={{ color: "#A1A1AA" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium" style={{ color: "#FAFAFA" }}>
                  {sym.title}
                </div>
                {sym.description && (
                  <div className="mt-0.5 text-[12px]" style={{ color: "#A1A1AA" }}>
                    {sym.description}
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: "#52525B" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}