import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { repairApi } from "@/lib/api";
import type { SymptomRead } from "@/components/repair/datasets";

export default function RepairSymptom({ slug }: { slug: string }) {
  const [symptom, setSymptom] = useState<SymptomRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    repairApi
      .getSymptomBySlug(slug)
      .then((s) => {
        if (mounted) {
          setSymptom(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <div>
      <div className="mb-4 font-mono text-[11px] tracking-wider">
        <Link
          to="/repair"
          className="ease-expo transition-colors hover:text-zinc-100"
          style={{ color: "#A1A1AA" }}
        >
          ← REPAIR GUIDE
        </Link>
      </div>
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
          § DIAGNOSTIC
        </div>
        <h1 className="mt-1 text-[22px] font-medium" style={{ color: "#FAFAFA" }}>
          {loading ? "Chargement…" : (symptom?.title ?? slug)}
        </h1>
        {symptom?.description && (
          <p className="mt-1 text-[12px]" style={{ color: "#A1A1AA" }}>
            {symptom.description}
          </p>
        )}
      </div>
      <div
        className="rounded-lg p-6"
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
          P2B
        </div>
        <div className="mt-2 text-[14px]" style={{ color: "#A1A1AA" }}>
          Contenu du guide — intégration prévue dans P2B.
        </div>
      </div>
    </div>
  );
}