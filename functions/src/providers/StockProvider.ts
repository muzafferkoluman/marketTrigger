export interface StockPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

/**
 * Interface for standardizing stock data lookups.
 * To use a real API like Yahoo Finance, Finnhub, or Alpha Vantage later:
 * 1. Create a new class (e.g. `FinnhubProvider`) that implements `IStockProvider`.
 * 2. In `index.ts`, replace `new MockStockProvider()` with `new FinnhubProvider(apiKey)`.
 */
export interface IStockProvider {
  /**
   * Fetches the current price for a set of stock symbols perfectly grouped.
   * @param symbols An array of unique stock ticker symbols
   */
  getPrices(symbols: string[]): Promise<Map<string, StockPrice>>;
}

export class MockStockProvider implements IStockProvider {
  async getPrices(symbols: string[]): Promise<Map<string, StockPrice>> {
    const prices = new Map<string, StockPrice>();
    
    // Generate a random mock price close to a baseline for demonstration
    symbols.forEach(symbol => {
      // e.g. Random price between 100 and 200
      const randomPrice = parseFloat((Math.random() * 100 + 100).toFixed(2));
      prices.set(symbol, {
        symbol,
        price: randomPrice,
        timestamp: Date.now()
      });
      console.log(`[MockProvider] Fetched mock price for ${symbol}: $${randomPrice}`);
    });
    
    return prices;
  }
}
