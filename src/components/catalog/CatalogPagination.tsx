import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onChangePage: (next: number) => void;
};

/**
 * Pagination numérotée avec écêtage (1 … n-1 n n+1 … total).
 */
export default function CatalogPagination({
  page,
  totalPages,
  onChangePage,
}: Props) {
  if (totalPages <= 1) return null;

  const visible = computeVisiblePages(page, totalPages);

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <PageButton
        onClick={() => onChangePage(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
      >
        <ChevronLeft size={13} strokeWidth={1.5} />
      </PageButton>
      {visible.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1.5 font-mono text-[11px] text-zinc-600"
          >
            …
          </span>
        ) : (
          <PageButton
            key={p}
            onClick={() => onChangePage(p)}
            active={p === page}
            aria-label={`Page ${p}`}
          >
            {p}
          </PageButton>
        ),
      )}
      <PageButton
        onClick={() => onChangePage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight size={13} strokeWidth={1.5} />
      </PageButton>
    </div>
  );
}

function computeVisiblePages(
  page: number,
  totalPages: number,
): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const out: Array<number | "…"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < totalPages - 1) out.push("…");
  out.push(totalPages);
  return out;
}

type PageButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
};

function PageButton({
  onClick,
  disabled = false,
  active = false,
  children,
  "aria-label": ariaLabel,
}: PageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="ease-expo flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-mono text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
      style={{
        background: active ? "rgba(59,130,246,0.12)" : "var(--mk-surface-2)",
        border: `0.5px solid ${active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
        color: active ? "#3B82F6" : "#a1a1aa",
      }}
    >
      {children}
    </button>
  );
}