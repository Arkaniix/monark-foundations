import { useState } from "react";
import { STEPS_LOGIN, STEPS_SIGNUP } from "./STEPS";
import TypingLine from "./TypingLine";

type SubmitSequenceProps = {
  mode: "login" | "signup";
  errorAt: number | null;
  onSettled?: () => void;
  onError?: () => void;
};

export default function SubmitSequence({ mode, errorAt, onSettled, onError }: SubmitSequenceProps) {
  const baseSteps = mode === "login" ? STEPS_LOGIN : STEPS_SIGNUP;
  const [idx, setIdx] = useState<number>(0);
  const [steps] = useState<string[]>(baseSteps);

  const advance = () => {
    setIdx((prev) => {
      const next = prev + 1;
      if (errorAt != null && prev === errorAt) {
        setTimeout(() => onError && onError(), 380);
        return prev;
      }
      if (next >= steps.length) {
        setTimeout(() => onSettled && onSettled(), 350);
        return prev;
      }
      return next;
    });
  };

  return (
    <div
      className="overlay-down absolute inset-0 z-30 flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,11,0.55), rgba(10,10,11,0.92))",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="w-full">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-dot" />
          {mode === "login" ? "AUTHENTIFICATION" : "PROVISIONING"}
        </div>
        <div className="space-y-2.5">
          {steps.map((s, i) => {
            if (i > idx) return null;
            const isError = errorAt != null && i === errorAt;
            const text = isError ? s.replace("…", "… ✗ Identifiants invalides") : s;
            return (
              <TypingLine
                key={i}
                text={text}
                started={i <= idx}
                onDone={i === idx ? advance : undefined}
                isFinal={!isError && i === steps.length - 1}
                isError={isError}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}