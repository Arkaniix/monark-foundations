/**
 * Dataset mock pour le catalogue V1.
 * Score Opportunité pré-calculé. Sparkline déterministique.
 */

import type {
  CatalogModel,
  HardwareCategory,
  Manufacturer,
} from "./datasets";

type RawRow = [
  HardwareCategory,
  string,
  Manufacturer,
  string | null,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
];

const RAW: RawRow[] = [
  // GPU
  ["GPU", "RTX 5090", "NVIDIA", null, "RTX 50", 1840, 4.2, 78, 18, 412, 3],
  ["GPU", "RTX 5080", "NVIDIA", null, "RTX 50", 1080, 3.1, 72, 16, 287, 4],
  ["GPU", "RTX 5070 Ti", "NVIDIA", null, "RTX 50", 780, 2.8, 70, 17, 198, 4],
  ["GPU", "RTX 5070", "NVIDIA", null, "RTX 50", 580, 1.9, 68, 14, 172, 5],
  ["GPU", "RTX 5060 Ti", "NVIDIA", null, "RTX 50", 420, 1.2, 62, 12, 134, 6],
  ["GPU", "RTX 4090", "NVIDIA", null, "RTX 40", 1290, 1.1, 84, 22, 887, 2],
  ["GPU", "RTX 4080 SUPER", "NVIDIA", null, "RTX 40", 720, 3.8, 81, 21, 543, 4],
  ["GPU", "RTX 4080", "NVIDIA", null, "RTX 40", 680, 1.4, 76, 19, 412, 5],
  ["GPU", "RTX 4070 Ti SUPER", "NVIDIA", null, "RTX 40", 590, 2.4, 76, 17, 421, 3],
  ["GPU", "RTX 4070 Ti", "NVIDIA", null, "RTX 40", 530, 0.8, 71, 15, 367, 4],
  ["GPU", "RTX 4070 SUPER", "NVIDIA", null, "RTX 40", 460, 1.7, 73, 16, 489, 4],
  ["GPU", "RTX 4070", "NVIDIA", null, "RTX 40", 380, 0.3, 67, 14, 612, 2],
  ["GPU", "RTX 4060 Ti 16GB", "NVIDIA", null, "RTX 40", 320, -0.5, 58, 11, 234, 5],
  ["GPU", "RTX 4060 Ti", "NVIDIA", null, "RTX 40", 290, -1.2, 56, 12, 384, 4],
  ["GPU", "RTX 4060", "NVIDIA", null, "RTX 40", 220, -0.8, 60, 13, 421, 3],
  ["GPU", "RTX 3090", "NVIDIA", null, "RTX 30", 580, -2.8, 52, 9, 234, 8],
  ["GPU", "RTX 3080 Ti", "NVIDIA", null, "RTX 30", 440, -2.1, 56, 11, 187, 7],
  ["GPU", "RTX 3080", "NVIDIA", null, "RTX 30", 350, -4.1, 45, 6, 198, 11],
  ["GPU", "RTX 3070 Ti", "NVIDIA", null, "RTX 30", 280, -3.2, 51, 9, 156, 9],
  ["GPU", "RTX 3070", "NVIDIA", null, "RTX 30", 240, -2.4, 58, 12, 312, 6],
  ["GPU", "RTX 3060 Ti", "NVIDIA", null, "RTX 30", 200, -1.8, 62, 13, 287, 5],
  ["GPU", "RTX 3060 12GB", "NVIDIA", null, "RTX 30", 170, -0.9, 64, 14, 421, 4],
  ["GPU", "RX 9070 XT", "AMD", null, "RX 9000", 650, 3.2, 71, 16, 142, 5],
  ["GPU", "RX 7900 XTX", "AMD", null, "RX 7000", 720, 3.1, 67, 19, 187, 5],
  ["GPU", "RX 7900 XT", "AMD", null, "RX 7000", 540, -0.4, 54, 11, 142, 6],
  ["GPU", "RX 7900 GRE", "AMD", null, "RX 7000", 450, 0.9, 62, 13, 98, 7],
  ["GPU", "RX 7800 XT", "AMD", null, "RX 7000", 380, 1.3, 68, 15, 134, 5],
  ["GPU", "RX 7700 XT", "AMD", null, "RX 7000", 300, 0.4, 64, 14, 112, 6],
  ["GPU", "RX 6800 XT", "AMD", null, "RX 6000", 320, -1.7, 53, 10, 87, 9],
  ["GPU", "RX 6700 XT", "AMD", null, "RX 6000", 230, -2.3, 58, 12, 134, 8],

  // CPU
  ["CPU", "Ryzen 9 9950X3D", "AMD", null, "Ryzen 9000", 720, 7.6, 50, 18, 87, 6],
  ["CPU", "Ryzen 7 9800X3D", "AMD", null, "Ryzen 9000", 493, 1.0, 84, 22, 412, 2],
  ["CPU", "Ryzen 9 9950X", "AMD", null, "Ryzen 9000", 435, 7.6, 67, 16, 187, 5],
  ["CPU", "Ryzen 9 9900X", "AMD", null, "Ryzen 9000", 360, 2.4, 64, 14, 142, 6],
  ["CPU", "Ryzen 7 9700X", "AMD", null, "Ryzen 9000", 280, 1.8, 71, 17, 198, 4],
  ["CPU", "Ryzen 5 9600X", "AMD", null, "Ryzen 9000", 220, 1.2, 73, 16, 234, 4],
  ["CPU", "Ryzen 7 7800X3D", "AMD", null, "Ryzen 7000", 380, -2.1, 76, 18, 612, 3],
  ["CPU", "Ryzen 9 7950X3D", "AMD", null, "Ryzen 7000", 540, -3.2, 56, 13, 287, 7],
  ["CPU", "Ryzen 9 7900X3D", "AMD", null, "Ryzen 7000", 420, -4.1, 51, 11, 198, 9],
  ["CPU", "Ryzen 9 7950X", "AMD", null, "Ryzen 7000", 350, -2.8, 62, 13, 234, 6],
  ["CPU", "Ryzen 9 7900X", "AMD", null, "Ryzen 7000", 290, -2.3, 64, 14, 198, 5],
  ["CPU", "Ryzen 7 7700X", "AMD", null, "Ryzen 7000", 220, -1.4, 68, 15, 287, 4],
  ["CPU", "Ryzen 5 7600X", "AMD", null, "Ryzen 7000", 170, -1.1, 71, 16, 312, 3],
  ["CPU", "Ryzen 7 5800X3D", "AMD", null, "Ryzen 5000", 280, -3.4, 64, 13, 421, 5],
  ["CPU", "Ryzen 9 5950X", "AMD", null, "Ryzen 5000", 240, -4.2, 54, 10, 234, 8],
  ["CPU", "Ryzen 7 5800X", "AMD", null, "Ryzen 5000", 130, -3.1, 67, 14, 312, 5],
  ["CPU", "Ryzen 5 5600X", "AMD", null, "Ryzen 5000", 95, -2.4, 73, 15, 387, 4],
  ["CPU", "Core Ultra 9 285K", "INTEL", null, "Core Ultra 200", 456, 6.2, 68, 12, 198, 4],
  ["CPU", "Core Ultra 7 265K", "INTEL", null, "Core Ultra 200", 340, 4.1, 71, 13, 142, 5],
  ["CPU", "Core Ultra 5 245K", "INTEL", null, "Core Ultra 200", 240, 2.8, 73, 14, 112, 5],
  ["CPU", "Core i9 14900K", "INTEL", null, "Core 14e gen", 380, -3.4, 58, 11, 287, 7],
  ["CPU", "Core i9 14900KF", "INTEL", null, "Core 14e gen", 340, -3.1, 60, 12, 198, 6],
  ["CPU", "Core i7 14700K", "INTEL", null, "Core 14e gen", 290, -2.4, 64, 13, 234, 5],
  ["CPU", "Core i5 14600K", "INTEL", null, "Core 14e gen", 210, -1.8, 69, 14, 312, 4],
  ["CPU", "Core i9 13900K", "INTEL", null, "Core 13e gen", 320, -4.2, 56, 10, 198, 8],
  ["CPU", "Core i7 13700K", "INTEL", null, "Core 13e gen", 230, -3.1, 61, 12, 234, 6],
  ["CPU", "Core i5 13600K", "INTEL", null, "Core 13e gen", 170, -2.4, 66, 13, 287, 5],
  ["CPU", "Core i7 12700K", "INTEL", null, "Core 12e gen", 160, -2.8, 60, 11, 187, 7],

  // RAM
  ["RAM", "DDR5 32GB 6000 CL30", "GSKILL", "Trident Z5", "DDR5", 110, 2.4, 78, 18, 234, 3],
  ["RAM", "DDR5 32GB 6400 CL32", "GSKILL", "Trident Z5", "DDR5", 130, 3.1, 71, 17, 198, 4],
  ["RAM", "DDR5 64GB 6000 CL30", "GSKILL", "Trident Z5", "DDR5", 240, 4.2, 64, 16, 142, 5],
  ["RAM", "DDR5 32GB 5600 CL36", "CORSAIR", "Vengeance", "DDR5", 95, 1.8, 73, 15, 187, 4],
  ["RAM", "DDR5 64GB 5200 CL36", "CRUCIAL", null, "DDR5", 210, 2.7, 67, 14, 112, 5],
  ["RAM", "DDR5 32GB 7200 CL34", "GSKILL", "Trident Z5", "DDR5", 170, 4.8, 56, 14, 87, 6],
  ["RAM", "DDR4 32GB 3600 CL16", "GSKILL", "Trident Z", "DDR4", 80, -2.4, 64, 12, 234, 6],
  ["RAM", "DDR4 32GB 3200 CL16", "CORSAIR", "Vengeance LPX", "DDR4", 70, -3.1, 67, 11, 287, 7],
  ["RAM", "DDR4 16GB 3600 CL16", "CORSAIR", "Vengeance", "DDR4", 45, -2.8, 71, 13, 312, 5],
  ["RAM", "DDR4 64GB 3600 CL18", "GSKILL", "Trident Z", "DDR4", 160, -3.4, 56, 10, 134, 8],

  // SSD
  ["SSD", "990 PRO 2TB", "SAMSUNG", null, "990 PRO", 170, 1.8, 78, 15, 412, 3],
  ["SSD", "990 PRO 1TB", "SAMSUNG", null, "990 PRO", 95, 1.2, 81, 14, 567, 2],
  ["SSD", "980 PRO 2TB", "SAMSUNG", null, "980 PRO", 140, -1.4, 71, 12, 312, 5],
  ["SSD", "980 PRO 1TB", "SAMSUNG", null, "980 PRO", 80, -1.8, 73, 11, 387, 4],
  ["SSD", "SN850X 2TB", "WD", "Black", "SN850X", 160, 2.4, 76, 14, 287, 4],
  ["SSD", "SN850X 1TB", "WD", "Black", "SN850X", 90, 1.7, 78, 13, 342, 3],
  ["SSD", "SN770 1TB", "WD", "Black", "SN770", 65, 0.8, 71, 11, 234, 4],
  ["SSD", "T705 2TB", "CRUCIAL", null, "T705", 240, 4.2, 64, 16, 142, 5],
  ["SSD", "T705 1TB", "CRUCIAL", null, "T705", 140, 3.4, 67, 15, 187, 4],
  ["SSD", "KC3000 2TB", "KINGSTON", null, "KC3000", 130, -0.8, 64, 12, 198, 6],

  // MOBO
  ["MOBO", "X870E Carbon WiFi", "MSI", null, "X870E", 480, 2.4, 64, 14, 87, 6],
  ["MOBO", "X870 Tomahawk WiFi", "MSI", null, "X870", 290, 1.8, 71, 16, 134, 5],
  ["MOBO", "X870 Aorus Elite", "GIGABYTE", null, "X870", 260, 1.4, 73, 15, 112, 5],
  ["MOBO", "X670E Hero", "ASUS", "ROG", "X670E", 580, -1.8, 56, 11, 87, 8],
  ["MOBO", "X670E Master", "GIGABYTE", "Aorus", "X670E", 380, -2.1, 60, 12, 98, 7],
  ["MOBO", "X670E Strix-A", "ASUS", "ROG", "X670E", 360, -1.4, 64, 13, 112, 6],
  ["MOBO", "B650E Tomahawk WiFi", "MSI", null, "B650E", 230, 0.8, 71, 16, 187, 4],
  ["MOBO", "B650 Aorus Elite AX", "GIGABYTE", null, "B650", 180, 0.4, 73, 15, 234, 4],
  ["MOBO", "B650M Mortar WiFi", "MSI", null, "B650M", 170, 1.2, 76, 17, 198, 4],
  ["MOBO", "B650M Pro RS WiFi", "ASROCK", null, "B650M", 140, 0.7, 78, 16, 142, 5],
  ["MOBO", "Z890 Tomahawk WiFi", "MSI", null, "Z890", 320, 3.1, 68, 13, 87, 5],
  ["MOBO", "Z890 Aorus Elite AX", "GIGABYTE", null, "Z890", 290, 2.4, 71, 14, 112, 5],
  ["MOBO", "Z790 Tomahawk", "MSI", null, "Z790", 220, -2.4, 64, 12, 142, 7],
  ["MOBO", "Z790 Aorus Elite", "GIGABYTE", null, "Z790", 200, -2.1, 67, 13, 134, 6],

  // PSU
  ["PSU", "RM850x Gold", "CORSAIR", null, "RMx", 130, 0.8, 76, 14, 287, 4],
  ["PSU", "RM1000x Gold", "CORSAIR", null, "RMx", 180, 1.4, 71, 15, 234, 4],
  ["PSU", "HX1200 Platinum", "CORSAIR", null, "HX", 240, 2.1, 67, 16, 142, 5],
  ["PSU", "HX1000 Platinum", "CORSAIR", null, "HX", 210, 1.8, 68, 15, 187, 5],
  ["PSU", "Pure Power 12M 850W", "BE QUIET", null, "Pure Power", 110, -0.4, 64, 12, 142, 6],
  ["PSU", "Focus PX-850", "SEASONIC", null, "Focus", 130, 1.2, 71, 13, 187, 5],
  ["PSU", "Focus PX-1000", "SEASONIC", null, "Focus", 160, 1.8, 67, 14, 142, 5],
  ["PSU", "SuperNOVA 850 G6", "EVGA", null, "SuperNOVA", 120, -1.8, 58, 11, 98, 8],
  ["PSU", "ROG Strix 1000W", "ASUS", "ROG", "Strix", 220, 2.4, 64, 15, 87, 6],
  ["PSU", "C850 Gold", "NZXT", null, "C-Series", 115, 0.8, 67, 12, 112, 6],
];

function computeOpportunityScore(
  liquidity_pct: number,
  margin_pct: number,
  trend_30d_pct: number,
): number {
  const liq = Math.max(0, Math.min(100, liquidity_pct));
  const marge = Math.max(0, Math.min(100, (margin_pct / 25) * 100));
  const trend = Math.max(0, Math.min(100, 50 + trend_30d_pct * 5));
  return Math.round(liq * 0.4 + marge * 0.35 + trend * 0.25);
}

function generateSparkline(median: number, trend_pct: number, seed: number): number[] {
  const points = 12;
  const drift = (median * trend_pct) / 100 / points;
  const noise = median * 0.025;
  const out: number[] = [];
  let cur = median * (1 - trend_pct / 100);
  for (let i = 0; i < points; i++) {
    const s = Math.sin(seed * 13.37 + i * 1.7) * noise;
    out.push(Math.round(cur + s));
    cur += drift;
  }
  return out;
}

let _idCounter = 0;
function nextId(): string {
  _idCounter += 1;
  return `mock_${_idCounter.toString().padStart(4, "0")}`;
}

export const CATALOG_MODELS: CatalogModel[] = RAW.map((row, idx) => {
  const [
    category,
    name,
    manufacturer,
    brand,
    family,
    median_eur,
    trend_30d_pct,
    liquidity_pct,
    margin_pct,
    n_obs,
    freshness_days,
  ] = row;
  return {
    id: nextId(),
    name,
    category,
    manufacturer,
    brand,
    family,
    median_eur,
    trend_30d_pct,
    liquidity_pct,
    margin_pct,
    n_obs,
    freshness_days,
    score: computeOpportunityScore(liquidity_pct, margin_pct, trend_30d_pct),
    sparkline_30d: generateSparkline(median_eur, trend_30d_pct, idx + 1),
    image_url: null,
  };
});