export type Platform = "LBC" | "Vinted" | "eBay";
export type ItemState = "Neuf" | "Comme neuf" | "Bon" | "Acceptable" | "Pour pièces";

export const MODELS: string[] = [
  "RTX 4070 Ti Super", "RTX 4090", "RTX 3090",
  "RX 7800 XT", "RX 7900 XTX",
  "AMD Ryzen 7 7800X3D", "AMD Ryzen 5 7600", "Intel i7-13700K",
  "Kit DDR5 32 Go 6000", "SSD 2 To NVMe Gen4",
];
export const STATES: ItemState[] = ["Neuf", "Comme neuf", "Bon", "Acceptable", "Pour pièces"];
export const PLATFORMS: Platform[] = ["LBC", "Vinted", "eBay"];
export const FEES: Record<Platform, number> = { LBC: 12, Vinted: 5, eBay: 18 };

export type EstimatorInputs = { model: string; state: ItemState; askPrice: number; platform: Platform };
export type EstimatorResult = {
  fair: number; netMargin: number; liq: number;
  verdict: string; color: string; glow: string; confidence: number;
  p10: number; p25: number; p50: number; p75: number; p90: number;
  trend: number; liqMod: number; valueVsNew: number;
  composite: { margin: number; liquidity: number; affinity: number };
  fees: number;
};

export function computeVerdict({ model, state, askPrice, platform }: EstimatorInputs): EstimatorResult {
  const baseMap: Record<string, number> = {
    "RTX 4070 Ti Super": 642, "RTX 4090": 1580, "RTX 3090": 612,
    "RX 7800 XT": 412, "RX 7900 XTX": 798,
    "AMD Ryzen 7 7800X3D": 339, "AMD Ryzen 5 7600": 188, "Intel i7-13700K": 268,
    "Kit DDR5 32 Go 6000": 98, "SSD 2 To NVMe Gen4": 124,
  };
  const base = baseMap[model] ?? 300;
  const stateMultMap: Record<ItemState, number> = { Neuf: 1.05, "Comme neuf": 1.00, Bon: 0.92, Acceptable: 0.80, "Pour pièces": 0.45 };
  const stateMult = stateMultMap[state];
  const fair = Math.round(base * stateMult);
  const ratio = askPrice / fair;
  const feesFrac = FEES[platform] / 100;
  const netMargin = Math.round(fair * (1 - feesFrac) - askPrice);
  const platLiqMap: Record<Platform, number> = { LBC: 0.78, Vinted: 0.61, eBay: 0.74 };
  const platLiq = platLiqMap[platform];
  const liq = Math.max(0.3, Math.min(0.95, platLiq + (ratio < 0.9 ? 0.06 : 0) - (ratio > 1.1 ? 0.08 : 0)));
  let verdict: string, color: string, glow: string;
  if (ratio <= 0.82) { verdict = "FONCER"; color = "#10B981"; glow = "glow-green"; }
  else if (ratio <= 0.97) { verdict = "NÉGOCIER"; color = "#F59E0B"; glow = "glow-amber"; }
  else if (ratio <= 1.10) { verdict = "TENTER AU CULOT"; color = "#8B5CF6"; glow = "glow-violet"; }
  else { verdict = "PASSER"; color = "#EF4444"; glow = "glow-red"; }
  const confidence = Math.round(70 + (1 - Math.min(1, Math.abs(ratio - 1))) * 25);
  const p10 = Math.round(fair * 0.78), p25 = Math.round(fair * 0.88), p50 = fair, p75 = Math.round(fair * 1.10), p90 = Math.round(fair * 1.22);
  const trend = ratio < 0.95 ? +6 : ratio > 1.05 ? -4 : +2;
  const liqMod = liq > 0.7 ? +3 : liq > 0.55 ? +1 : -2;
  const valueVsNew = state === "Neuf" ? -3 : state === "Comme neuf" ? -1 : state === "Bon" ? +2 : +4;
  const affinityMap: Record<Platform, number> = { LBC: 88, eBay: 82, Vinted: 64 };
  const composite = {
    margin: Math.max(5, Math.min(95, 50 + (netMargin / fair) * 200)),
    liquidity: Math.round(liq * 100),
    affinity: affinityMap[platform],
  };
  return { fair, netMargin, liq, verdict, color, glow, confidence, p10, p25, p50, p75, p90, trend, liqMod, valueVsNew, composite, fees: FEES[platform] };
}