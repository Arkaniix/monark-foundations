import type { Scene } from "./scenes";
import LbcMockup from "./LbcMockup";
import VintedMockup from "./VintedMockup";
import EbayMockup from "./EbayMockup";

type Props = { s: Scene; dense?: boolean };

export default function PlatformMockup({ s, dense = false }: Props) {
  if (s.key === "vinted") return <VintedMockup s={s} dense={dense} />;
  if (s.key === "ebay") return <EbayMockup s={s} dense={dense} />;
  return <LbcMockup s={s} dense={dense} />;
}