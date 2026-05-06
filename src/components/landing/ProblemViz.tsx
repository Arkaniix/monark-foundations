import UndercutViz from "./UndercutViz";
import VolatilityVizPlaceholder from "./VolatilityVizPlaceholder";
import ScamsVizPlaceholder from "./ScamsVizPlaceholder";

type Props = { kind: "vol" | "scams" | "under" };

export default function ProblemViz({ kind }: Props) {
  if (kind === "vol") return <VolatilityVizPlaceholder />;
  if (kind === "scams") return <ScamsVizPlaceholder />;
  return <UndercutViz />;
}