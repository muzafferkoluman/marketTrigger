import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconSymbol } from '../../components/ui/icon-symbol';

import { fetchUserTriggers, deleteTrigger, Trigger } from '../../lib/triggers';
import { useAuthStore } from '../../store/useAuthStore';

export default function TriggersScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: triggers, isLoading, isError } = useQuery({
    queryKey: ['triggers', user?.uid],
    queryFn: () => fetchUserTriggers(user!.uid),
    enabled: !!user?.uid,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrigger(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', user?.uid] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete trigger");
    }
  });

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Trigger",
      "Are you sure you want to delete this alert?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  const renderTrigger = ({ item }: { item: Trigger }) => {
    let conditionText = '';
    switch(item.conditionType) {
      case 'price_above': conditionText = `Price > $${item.targetValue}`; break;
      case 'price_below': conditionText = `Price < $${item.targetValue}`; break;
      case 'percent_change_up': conditionText = `Up ${item.targetValue}% (Base: $${item.baselinePrice})`; break;
      case 'percent_change_down': conditionText = `Down ${item.targetValue}% (Base: $${item.baselinePrice})`; break;
    }

    return (
      <View style={[styles.triggerItem, item.status === 'triggered' && styles.triggeredItem]}>
        <View style={styles.triggerInfo}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.condition}>{conditionText}</Text>
          <Text style={styles.status}>Status: {item.status.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id!)}>
          <IconSymbol name="trash.fill" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Triggers</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
      ) : isError ? (
        <Text style={styles.errorText}>Failed to load triggers.</Text>
      ) : triggers?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have no active triggers.</Text>
          <Text style={styles.emptySubtext}>Search for a stock to create one.</Text>
        </View>
      ) : (
        <FlatList
          data={triggers}
          keyExtractor={(item) => item.id!}
          renderItem={renderTrigger}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', paddingHorizontal: 20, marginBottom: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  triggerItem: {
    flexDirection: 'row',
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
  triggeredItem: {
    backgroundColor: '#f1f2f6',
    opacity: 0.8
  },
  triggerInfo: { flex: 1 },
  symbol: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  condition: { fontSize: 14, color: '#34495e', marginTop: 4 },
  status: { fontSize: 12, color: '#7f8c8d', marginTop: 8, fontWeight: 'bold' },
  deleteBtn: { padding: 10 },
  errorText: { color: '#e74c3c', textAlign: 'center', marginTop: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, color: '#34495e', fontWeight: 'bold' },
  emptySubtext: { fontSize: 14, color: '#7f8c8d', marginTop: 8 }
});
