import type { ComponentType, ReactNode } from "react";

type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  cta?: { label: string; onClick: () => void };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
    >
      {Icon && (
        <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.025]">
          <Icon className="w-6 h-6 text-zinc-500" />
        </div>
      )}
      <h3 className="text-[15px] font-medium text-zinc-200">{title}</h3>
      {description && (
        <div className="mt-2 text-[13px] text-zinc-500 max-w-sm">
          {description}
        </div>
      )}
      {cta && (
        <button
          type="button"
          onClick={cta.onClick}
          className="mt-5 text-[13px] font-medium px-3.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-100 ease-expo transition-colors"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;