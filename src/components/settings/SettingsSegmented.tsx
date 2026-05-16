import type { CSSProperties } from "react";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  sublabel?: string;
};

type Props<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (next: T) => void;
  ariaLabel: string;
};

const groupStyle: CSSProperties = {
  display: "inline-flex",
  gap: 2,
  padding: 2,
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
};

export default function SettingsSegmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: Props<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} style={groupStyle}>
      {options.map((opt) => {
        const active = opt.value === value;
        const btnStyle: CSSProperties = {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          padding: "7px 14px",
          fontSize: 12,
          background: active ? "#27272A" : "transparent",
          color: active ? "#FAFAFA" : "#A1A1AA",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          transition:
            "background 200ms cubic-bezier(0.16,1,0.3,1), color 200ms cubic-bezier(0.16,1,0.3,1)",
          outline: "none",
        };
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = "#FAFAFA";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = "#A1A1AA";
            }}
            style={btnStyle}
          >
            <span style={{ lineHeight: 1.2 }}>{opt.label}</span>
            {opt.sublabel && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: active ? "#A1A1AA" : "#52525B",
                  lineHeight: 1.2,
                }}
              >
                {opt.sublabel}
              </span>
            )}
          </button>
        );
      })}
      {/* TODO: keyboard nav (ArrowLeft/ArrowRight) */}
    </div>
  );
}