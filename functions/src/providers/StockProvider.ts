export interface StockPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface IStockProvider {
  /**
   * Fetches the current price for a set of stock symbols perfectly grouped.
   * @param symbols An array of unique stock ticker symbols
   */
  getPrices(symbols: string[]): Promise<Map<string, StockPrice>>;
}

/**
 * Concrete implementation for Finnhub (finnhub.io)
 * Isolated adapter so provider-specific details do not leak into the evaluator.
 */
export class FinnhubProvider implements IStockProvider {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Finnhub API key is required to initialize FinnhubProvider");
    }
    this.apiKey = apiKey;
  }

  /**
   * Private helper to perform an HTTP request with basic retry logic.
   * Useful for handling transient network errors or brief rate limit hiccups.
   */
  private async fetchWithRetry(url: string, retries = 2): Promise<any> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          // If we hit a rate limit (429), it's best to wait and retry.
          // Note: A robust system might use a message queue rather than inline delays.
          console.warn(`[FinnhubProvider] Rate limited. Retrying attempt ${i + 1}/${retries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential-ish backoff
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries) throw error;
        console.warn(`[FinnhubProvider] Fetch failed. Retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  async getPrices(symbols: string[]): Promise<Map<string, StockPrice>> {
    const prices = new Map<string, StockPrice>();
    
    // Process symbols concurrently. 
    // IMPORTANT: If 'symbols' array is very large, Promise.all might hit the API rate limit.
    // In that case, we should chunk the requests or cache recent price lookups via Redis/Firestore.
    const promises = symbols.map(async (symbol) => {
      try {
        const url = `${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`;
        const data = await this.fetchWithRetry(url);
        
        // Finnhub 'quote' endpoint returns current price in the 'c' field.
        if (data && typeof data.c === 'number') {
          prices.set(symbol, {
            symbol,
            price: data.c,
            timestamp: Date.now()
          });
          console.log(`[FinnhubProvider] Fetched real price for ${symbol}: $${data.c}`);
        } else {
          console.error(`[FinnhubProvider] Invalid data format returned for ${symbol}`);
        }
      } catch (error) {
        console.error(`[FinnhubProvider] Failed to fetch price for ${symbol}:`, error);
        // Error is safely caught here so one failed symbol doesn't crash the entire batch lookup.
      }
    });

    await Promise.all(promises);
    return prices;
  }
}

/**
 * Fallback local mock provider for development without API keys.
 */
export class MockStockProvider implements IStockProvider {
  async getPrices(symbols: string[]): Promise<Map<string, StockPrice>> {
    const prices = new Map<string, StockPrice>();
    symbols.forEach(symbol => {
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
