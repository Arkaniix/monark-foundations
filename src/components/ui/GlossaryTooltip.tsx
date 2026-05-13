import type { ReactNode } from "react";
import Tooltip from "./Tooltip";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

type GlossaryTooltipProps = {
  term: GlossaryKey;
  children: ReactNode;
  position?: "top" | "bottom";
};

/**
 * Wrapper spécialisé qui hydrate un Tooltip à partir d'une entrée
 * du glossaire central.
 */
export default function GlossaryTooltip({
  term,
  children,
  position,
}: GlossaryTooltipProps) {
  const entry = GLOSSARY[term];
  if (!entry) return <>{children}</>;

  return (
    <Tooltip
      position={position}
      content={
        <span className="block">
          <span className="mb-1 block font-mono text-[10px] tracking-[0.12em] text-blue-300">
            {entry.title}
          </span>
          <span className="block text-[11.5px] text-zinc-200">{entry.body}</span>
          {entry.example && (
            <span className="mt-1.5 block text-[10.5px] italic text-zinc-500">
              {entry.example}
            </span>
          )}
        </span>
      }
    >
      {children}
    </Tooltip>
  );
}