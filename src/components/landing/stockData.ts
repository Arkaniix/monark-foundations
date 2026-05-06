export type StockRow = { name: string; buy: number; hold: number; profit: number; status: "vendu" | "actif" };

export const STOCK_ROWS: StockRow[] = [
  { name: "RTX 4070 Ti", buy: 380, hold: 4, profit: 62, status: "vendu" },
  { name: "R7 7800X3D", buy: 290, hold: 7, profit: 49, status: "actif" },
  { name: "B650 Tomahawk", buy: 99, hold: 11, profit: -8, status: "actif" },
  { name: "DDR5 32 Go", buy: 64, hold: 2, profit: 22, status: "vendu" },
  { name: "RX 7800 XT", buy: 340, hold: 18, profit: 28, status: "actif" },
];