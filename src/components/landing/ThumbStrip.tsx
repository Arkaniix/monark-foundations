import { Pict } from "./Pict";

type Props = { count?: number; pictKey?: string; icons?: string[] };

export default function ThumbStrip({ count = 4, icons }: Props) {
  const list = icons || ["Box", "CPU", "Zap", "Layers"];
  const grads = [
    "linear-gradient(135deg, #18181b, #0c0c0e)",
    "linear-gradient(155deg, #1a1a1f, #0b0b0d)",
    "linear-gradient(125deg, #1c1c20, #0a0a0c)",
    "linear-gradient(110deg, #15151a, #0d0d11)",
  ];
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${count}, minmax(0,1fr))` }}>
      {list.slice(0, count).map((k, i) => {
        const Icon = Pict[k] || Pict.Box;
        return (
          <div key={i} className="relative aspect-square rounded overflow-hidden" style={{ background: grads[i % 4] }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon style={{ width: "42%", height: "42%", color: "rgba(255,255,255,0.22)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}