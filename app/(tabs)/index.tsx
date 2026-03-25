import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';

import { usePopularStocks } from '../../hooks/useMarketData';
import { Stock } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

export default function HomeScreen() {
  const { data: popularStocks, isLoading, isError } = usePopularStocks();
  const { user } = useAuthStore();

  const renderStockItem = ({ item }: { item: Stock }) => {
    const isPositive = item.change >= 0;
    return (
      <Link href={{ pathname: '/create', params: { symbol: item.symbol } }} asChild>
        <TouchableOpacity style={styles.stockItem}>
          <View>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            <Text style={[styles.change, { color: isPositive ? '#2ecc71' : '#e74c3c' }]}>
              {isPositive ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MarketTrigger</Text>
        <Link href="/search" asChild>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search Stocks</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text style={styles.sectionTitle}>Popular Stocks</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
      ) : isError ? (
        <Text style={styles.errorText}>Failed to load stocks.</Text>
      ) : (
        <FlatList
          data={popularStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={renderStockItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  searchButton: { 
    backgroundColor: '#3498db', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  searchButtonText: { color: '#ffffff', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 20, color: '#34495e' },
  listContent: { paddingHorizontal: 20 },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  symbol: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  name: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  change: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  errorText: { color: '#e74c3c', textAlign: 'center', marginTop: 20 },
});
