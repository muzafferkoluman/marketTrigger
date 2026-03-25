import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StockSymbol } from '../types';

// Hardcoded mock data as requested
const MOCK_STOCKS: (StockSymbol & { currentPrice: string })[] = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', exchange: 'NASDAQ', currentPrice: '173.50' },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.', exchange: 'NASDAQ', currentPrice: '175.22' },
  { symbol: 'NVDA', companyName: 'NVIDIA Corp', exchange: 'NASDAQ', currentPrice: '880.08' },
  { symbol: 'MSFT', companyName: 'Microsoft Corp', exchange: 'NASDAQ', currentPrice: '425.22' },
  { symbol: 'AMZN', companyName: 'Amazon.com, Inc.', exchange: 'NASDAQ', currentPrice: '180.38' },
  { symbol: 'META', companyName: 'Meta Platforms, Inc.', exchange: 'NASDAQ', currentPrice: '510.92' },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', exchange: 'NASDAQ', currentPrice: '155.49' },
  { symbol: 'NFLX', companyName: 'Netflix, Inc.', exchange: 'NASDAQ', currentPrice: '620.15' },
  { symbol: 'AMD', companyName: 'Advanced Micro Devices', exchange: 'NASDAQ', currentPrice: '155.30' },
  { symbol: 'INTC', companyName: 'Intel Corporation', exchange: 'NASDAQ', currentPrice: '38.40' },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredStocks = useMemo(() => {
    if (!query.trim()) {
      return MOCK_STOCKS.slice(0, 5); // Show first 5 as "popular" if empty
    }
    const lowerQuery = query.toLowerCase();
    return MOCK_STOCKS.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.companyName.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleStockPress = (stock: StockSymbol) => {
    router.push({
      pathname: '/create',
      params: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        exchange: stock.exchange,
      }
    });
  };

  const renderStockItem = ({ item }: { item: typeof MOCK_STOCKS[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleStockPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text style={styles.companyName} numberOfLines={1}>{item.companyName}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.price}>${item.currentPrice}</Text>
        <Text style={styles.exchange}>{item.exchange}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by symbol or company name"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          autoFocus
          clearButtonMode="while-editing"
        />
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        {query.trim() === '' ? 'Popular Stocks' : 'Search Results'}
      </Text>

      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStockItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No stocks found for "{query}"</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 50 },
  searchHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 20 
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50'
  },
  cancelBtn: { marginLeft: 15 },
  cancelText: { color: '#3498db', fontSize: 16, fontWeight: '500' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#7f8c8d', paddingHorizontal: 16, marginBottom: 10, textTransform: 'uppercase' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardInfo: { flex: 1, paddingRight: 10 },
  symbol: { fontSize: 18, fontWeight: 'bold', color: '#34495e', marginBottom: 4 },
  companyName: { fontSize: 14, color: '#7f8c8d' },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
  exchange: { fontSize: 12, color: '#bdc3c7', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#7f8c8d', marginTop: 40, fontSize: 16 }
});
