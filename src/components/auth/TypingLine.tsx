import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

type TypingLineProps = {
  text: string;
  started: boolean;
  onDone?: () => void;
  isFinal?: boolean;
  isError?: boolean;
};

export default function TypingLine({ text, started, onDone, isFinal, isError }: TypingLineProps) {
  const [shown, setShown] = useState<number>(0);
  useEffect(() => {
    if (!started) return;
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(i);
      if (i >= text.length) {
        clearInterval(id);
        onDone && onDone();
      }
    }, 22);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, text]);
  const done = shown >= text.length;
  return (
    <div className="flex items-start gap-2 font-mono text-[11.5px] leading-relaxed">
      <span className={isFinal ? "text-emerald-400" : isError ? "text-red-400" : "text-zinc-300"}>
        {started ? text.slice(0, shown) : ""}
        {started && shown < text.length && (
          <span
            className="inline-block w-[6px] h-[12px] -mb-[1px] ml-[1px] bg-zinc-400 align-middle"
            style={{ animation: "pulse-dot 0.9s ease-in-out infinite" }}
          />
        )}
      </span>
      {done && !isFinal && !isError && <Check className="w-3.5 h-3.5 text-emerald-400 mt-[2px] shrink-0" />}
      {done && isError && <X className="w-3.5 h-3.5 text-red-400 mt-[2px] shrink-0" />}
    </div>
  );
}