import UndercutViz from "./UndercutViz";
import VolatilityViz from "./VolatilityViz";
import ScamsViz from "./ScamsViz";

type Props = { kind: "vol" | "scams" | "under" };

export default function ProblemViz({ kind }: Props) {
  if (kind === "vol") return <VolatilityViz />;
  if (kind === "scams") return <ScamsViz />;
  return <UndercutViz />;
}