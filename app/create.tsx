import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTrigger } from '../lib/triggers';
import { useAuthStore } from '../store/useAuthStore';
import { fetchStockPrice } from '../lib/api';

type ConditionType = 'price_above' | 'price_below' | 'percent_change_up' | 'percent_change_down';

export default function CreateTriggerScreen() {
  const { symbol } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [condition, setCondition] = useState<ConditionType>('price_above');
  const [targetValue, setTargetValue] = useState('');

  useEffect(() => {
    if (symbol) {
      fetchStockPrice(symbol as string).then(setCurrentPrice);
    }
  }, [symbol]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (!symbol || !currentPrice || !targetValue) throw new Error("Missing fields");
      
      const parsedValue = parseFloat(targetValue);
      if (isNaN(parsedValue)) throw new Error("Invalid target value");

      await createTrigger({
        uid: user.uid,
        symbol: (symbol as string).toUpperCase(),
        conditionType: condition,
        targetValue: parsedValue,
        baselinePrice: currentPrice,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', user?.uid] });
      Alert.alert("Success", "Trigger created successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create trigger");
    }
  });

  const handleSave = () => {
    // Validate trigger limit
    const activeTriggersCount = queryClient.getQueryData<any[]>(['triggers', user?.uid])?.filter(t => t.status === 'active')?.length || 0;
    
    // Check if limits exceeded (for mock we just assume they are not premium yet as checked by the paywall later)
    if (activeTriggersCount >= 3) {
      Alert.alert(
        "Limit Reached",
        "Free users can only have 3 active triggers. Please upgrade to Premium.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push('/paywall') }
        ]
      );
      return;
    }

    createMutation.mutate();
  };

  if (!symbol) return <Text style={{padding: 20}}>No symbol provided.</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.symbolText}>{symbol}</Text>
        <Text style={styles.priceText}>
          Current Price: {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Loading...'}
        </Text>
      </View>

      <Text style={styles.label}>Select Condition</Text>
      <View style={styles.conditionGrid}>
        {[
          { id: 'price_above', label: 'Price goes above' },
          { id: 'price_below', label: 'Price drops below' },
          { id: 'percent_change_up', label: '% Gain over' },
          { id: 'percent_change_down', label: '% Drop over' },
        ].map((c) => (
          <TouchableOpacity 
            key={c.id} 
            style={[styles.conditionBtn, condition === c.id && styles.conditionBtnActive]}
            onPress={() => setCondition(c.id as ConditionType)}
          >
            <Text style={[styles.conditionText, condition === c.id && styles.conditionTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Target Value</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder={condition.includes('percent') ? "e.g., 5 for 5%" : "e.g., 150.00"}
        value={targetValue}
        onChangeText={setTargetValue}
      />

      <TouchableOpacity 
        style={[styles.saveBtn, createMutation.isPending && styles.saveBtnLoading]} 
        onPress={handleSave}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Create Alert</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  symbolText: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50' },
  priceText: { fontSize: 18, color: '#7f8c8d', marginTop: 10 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#34495e', marginBottom: 15 },
  conditionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  conditionBtn: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    alignItems: 'center'
  },
  conditionBtnActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  conditionText: { color: '#2c3e50', fontWeight: '500' },
  conditionTextActive: { color: '#ffffff', fontWeight: 'bold' },
  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginBottom: 40,
  },
  saveBtn: { backgroundColor: '#2ecc71', padding: 18, borderRadius: 10, alignItems: 'center' },
  saveBtnLoading: { opacity: 0.7 },
  saveBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
