import { useLayoutEffect, useRef, useState } from "react";

type SegmentedOption<K extends string> = { key: K; label: string };

export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ x: number; w: number }>({ x: 0, w: 0 });

  useLayoutEffect(() => {
    const btn = btnRefs.current[value];
    if (btn) setPill({ x: btn.offsetLeft, w: btn.offsetWidth });
  }, [value, options]);

  return (
    <div className="mode-seg">
      <span className="mode-seg__pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} />
      {options.map((o) => (
        <button
          key={o.key}
          ref={(el) => {
            btnRefs.current[o.key] = el;
          }}
          onClick={() => onChange(o.key)}
          className="mode-seg__btn"
          style={{ color: o.key === value ? "#fafafa" : "#a1a1aa" }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}