export interface NsePreOpenData {
  declines: number;
  unchanged: number;
  data: NseStockItem[];
}

export interface NseStockItem {
  metadata: NseMetadata;
  detail: NseDetail;
}

export interface NseMetadata {
  symbol: string;
  identifier: string;
  series: string;
  purpose: string | null;
  lastPrice: number;
  change: number;
  pChange: number;
  previousClose: number;
  finalQuantity: number;
  totalTurnover: number;
  marketCap: number | string;
  yearHigh: number;
  yearLow: number;
  iep: number;
}

export interface NseDetail {
  preOpenMarket: {
    preopen: NsePreOpenQuote[];
    ato: {
      totalBuyQuantity: number;
      totalSellQuantity: number;
    };
    IEP: number;
    totalTradedVolume: number;
    finalPrice: number;
    finalQuantity: number;
    lastUpdateTime: string;
    totalSellQuantity: number;
    totalBuyQuantity: number;
    Change: number;
    perChange: number;
    prevClose: number;
  };
}

export interface NsePreOpenQuote {
  price: number;
  buyQty: number;
  sellQty: number;
  iep?: boolean;
}

export interface NseChartData {
  identifier: string;
  name: string;
  grapthData: [number, number, string, string, string][];
}
