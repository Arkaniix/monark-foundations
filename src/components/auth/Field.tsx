import { useState, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string | null;
  valid?: boolean;
  rightSlot?: ReactNode;
  autoComplete?: string;
  name?: string;
  placeholder?: string;
};

export default function Field({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  rightSlot,
  autoComplete,
  name,
  placeholder,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const labelColor = focused ? "text-blue-400" : error ? "text-red-400" : "text-zinc-500";
  return (
    <div className="space-y-1.5">
      <label className={`block text-xs font-medium transition-colors ${labelColor}`}>{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          placeholder={placeholder}
          className={
            "w-full h-11 px-4 rounded-lg bg-white/[0.02] text-zinc-100 placeholder:text-zinc-600 text-[14px] outline-none transition-all duration-150 " +
            (error
              ? "border border-red-500/50 ring-1 ring-red-500/15"
              : focused
                ? "border border-blue-500/40 ring-1 ring-blue-500/20"
                : "border border-white/[0.08] hover:border-white/[0.14]")
          }
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-[11.5px] text-red-400/90 pl-0.5">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}
    </div>
  );
}
