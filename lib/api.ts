export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Mock data for development MVP
const MOCK_POPULAR_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, change: 1.20, changePercent: 0.70 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.55, change: -2.10, changePercent: -0.50 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 0.85, changePercent: 0.60 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 175.35, change: 3.15, changePercent: 1.83 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 202.64, change: -5.40, changePercent: -2.59 },
];

export const fetchPopularStocks = async (): Promise<Stock[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_POPULAR_STOCKS;
};

export const searchStocks = async (query: string): Promise<Stock[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (!query) return [];
  const q = query.toLowerCase();
  return MOCK_POPULAR_STOCKS.filter(
    stock => stock.symbol.toLowerCase().includes(q) || stock.name.toLowerCase().includes(q)
  );
};

export const fetchStockPrice = async (symbol: string): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const stock = MOCK_POPULAR_STOCKS.find(s => s.symbol === symbol.toUpperCase());
  return stock ? stock.price : 100.00; // default mock price
};
