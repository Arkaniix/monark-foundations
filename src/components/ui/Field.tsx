import type { ReactNode } from "react";

type FieldProps = { label: string; children: ReactNode };

export default function Field({ label, children }: FieldProps) {
  return (
    <div>
      <div className="font-mono text-[10px] text-zinc-500 tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  );
}

export { Field };