import { Pict } from "./Pict";

type Props = { pictKey?: string; thumbVariant?: number };

export default function PhotoPlaceholder({ pictKey = "GPU", thumbVariant = 0 }: Props) {
  const Icon = Pict[pictKey] || Pict.CPU;
  const grads = [
    "linear-gradient(135deg, #18181b 0%, #0c0c0e 100%)",
    "linear-gradient(135deg, #1a1a1d 0%, #0a0a0b 100%)",
    "linear-gradient(160deg, #1c1c20 0%, #0a0a0c 100%)",
    "linear-gradient(110deg, #16161a 0%, #0d0d10 100%)",
  ];
  return (
    <div className="relative w-full h-full overflow-hidden rounded-md" style={{ background: grads[thumbVariant % 4] }}>
      <svg width="100%" height="100%" className="absolute inset-0 opacity-40">
        <defs>
          <pattern id={"diag-" + pictKey + "-" + thumbVariant} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.025)" strokeWidth="1.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={"url(#diag-" + pictKey + "-" + thumbVariant + ")"}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon style={{ width: "38%", height: "38%", color: "rgba(255,255,255,0.30)" }}/>
      </div>
      <div className="absolute top-2 left-2 font-mono text-[9px] text-zinc-700">img_0{thumbVariant + 1}.jpg</div>
    </div>
  );
}