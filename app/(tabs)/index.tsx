import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StockSymbol } from '../../types';

// Hardcoded mock data as requested
const MOCK_STOCKS: (StockSymbol & { currentPrice: string })[] = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', exchange: 'NASDAQ', currentPrice: '173.50' },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.', exchange: 'NASDAQ', currentPrice: '175.22' },
  { symbol: 'NVDA', companyName: 'NVIDIA Corp', exchange: 'NASDAQ', currentPrice: '880.08' },
  { symbol: 'MSFT', companyName: 'Microsoft Corp', exchange: 'NASDAQ', currentPrice: '425.22' },
  { symbol: 'AMZN', companyName: 'Amazon.com, Inc.', exchange: 'NASDAQ', currentPrice: '180.38' },
  { symbol: 'META', companyName: 'Meta Platforms, Inc.', exchange: 'NASDAQ', currentPrice: '510.92' },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', exchange: 'NASDAQ', currentPrice: '155.49' }
];

export default function HomeScreen() {
  const router = useRouter();

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
      <View style={styles.cardHeader}>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text style={styles.price}>${item.currentPrice}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.companyName} numberOfLines={1}>{item.companyName}</Text>
        <Text style={styles.exchange}>{item.exchange}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Popular Stocks</Text>
      <FlatList
        data={MOCK_STOCKS}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStockItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginVertical: 20, marginTop: 40 },
  listContent: { paddingBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  symbol: { fontSize: 18, fontWeight: 'bold', color: '#34495e' },
  price: { fontSize: 18, fontWeight: '600', color: '#2ecc71' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyName: { fontSize: 14, color: '#7f8c8d', flex: 1, paddingRight: 10 },
  exchange: { fontSize: 12, color: '#bdc3c7', fontWeight: '500' }
});
