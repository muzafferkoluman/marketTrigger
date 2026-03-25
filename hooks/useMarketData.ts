import { useQuery } from '@tanstack/react-query';
import { fetchPopularStocks, searchStocks, fetchStockPrice, Stock } from '../lib/api';

export const usePopularStocks = () => {
  return useQuery<Stock[]>({
    queryKey: ['popularStocks'],
    queryFn: fetchPopularStocks,
  });
};

export const useSearchStocks = (query: string) => {
  return useQuery({
    queryKey: ['searchStocks', query],
    queryFn: () => searchStocks(query),
    enabled: query.length > 0,
  });
};

export const useStockPrice = (symbol: string) => {
  return useQuery({
    queryKey: ['stockPrice', symbol],
    queryFn: () => fetchStockPrice(symbol),
    enabled: !!symbol,
  });
};
