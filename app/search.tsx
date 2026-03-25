import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';

import { useSearchStocks } from '../hooks/useMarketData';
import { Stock } from '../lib/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  // Use a debounced approach in a real app, but for MVP straight query is fine since it's mock
  const { data: searchResults, isLoading, isError } = useSearchStocks(query);

  const renderStockItem = ({ item }: { item: Stock }) => (
    <Link href={{ pathname: '/create', params: { symbol: item.symbol } }} asChild>
      <TouchableOpacity style={styles.stockItem}>
        <View>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by symbol or name (e.g. AAPL)"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      {isLoading && query.length > 0 ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
      ) : isError ? (
        <Text style={styles.errorText}>Failed to search stocks.</Text>
      ) : query.length > 0 && (!searchResults || searchResults.length === 0) ? (
        <Text style={styles.emptyText}>No stocks found for "{query}"</Text>
      ) : (
        <FlatList
          data={searchResults}
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  searchInput: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#2c3e50'
  },
  listContent: { padding: 20 },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  errorText: { color: '#e74c3c', textAlign: 'center', marginTop: 20 },
  emptyText: { color: '#7f8c8d', textAlign: 'center', marginTop: 20 },
});
