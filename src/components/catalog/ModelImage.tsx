import { Cpu, MemoryStick, HardDrive, CircuitBoard, Plug, Gamepad2 } from "lucide-react";
import type { HardwareCategory } from "./datasets";

const ICON: Record<HardwareCategory, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  GPU: Gamepad2,
  CPU: Cpu,
  RAM: MemoryStick,
  SSD: HardDrive,
  MOBO: CircuitBoard,
  PSU: Plug,
};

type Props = {
  category: HardwareCategory;
  url?: string | null;
  className?: string;
};

export default function ModelImage({ category, url, className }: Props) {
  const Icon = ICON[category];
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={`h-full w-full object-cover ${className ?? ""}`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`flex h-full w-full items-center justify-center ${className ?? ""}`}>
      <Icon className="h-8 w-8 text-zinc-700" strokeWidth={1.25} />
    </div>
  );
}