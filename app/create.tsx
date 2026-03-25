import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTrigger, getUserTriggers } from '../lib/triggers';
import { useAuthStore } from '../store/useAuthStore';
import { TriggerFormData, TriggerConditionType } from '../types';
import { APP_CONFIG, CONDITION_LABELS } from '../constants';
import { validateTriggerForm } from '../utils/validation';

export default function CreateTriggerScreen() {
  const { symbol, companyName, exchange } = useLocalSearchParams<{ symbol: string; companyName: string; exchange: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [form, setForm] = useState<TriggerFormData>({
    symbol: symbol || '',
    companyName: companyName || '',
    exchange: exchange || '',
    conditionType: 'price_above',
    targetValue: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TriggerFormData, string>>>({});

  const createMutation = useMutation({
    mutationFn: async (data: TriggerFormData) => {
      if (!user) throw new Error('You must be logged in to create a trigger');
      return createTrigger(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', user?.uid] });
      router.back();
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to create trigger');
    }
  });

  const handleSave = async () => {
    // 1. Validate Form
    const validation = validateTriggerForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

    // 2. Validate Limit Enforcements
    // We fetch the cached triggers or fetch fresh if none cached.
    const cachedTriggers = queryClient.getQueryData<any[]>(['triggers', user?.uid]);
    let activeCount = 0;

    if (cachedTriggers) {
      activeCount = cachedTriggers.filter(t => t.isActive).length;
    } else if (user) {
      const dbTriggers = await getUserTriggers(user.uid);
      activeCount = dbTriggers.filter(t => t.isActive).length;
    }

    if (activeCount >= APP_CONFIG.FREE_TRIGGER_LIMIT) {
      Alert.alert(
        "Trigger Limit Reached",
        `Free users can only have ${APP_CONFIG.FREE_TRIGGER_LIMIT} active triggers. Please upgrade to Premium to create more.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade Options", onPress: () => router.push('/paywall') }
        ]
      );
      return;
    }

    // 3. Submit
    createMutation.mutate(form);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Create Alert</Text>
        <Text style={styles.subtitle}>{form.symbol ? form.symbol.toUpperCase() : 'Any Stock'}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Stock Symbol</Text>
        <TextInput
          style={[styles.input, errors.symbol && styles.inputError]}
          placeholder="e.g. AAPL"
          value={form.symbol}
          onChangeText={(text) => setForm(prev => ({ ...prev, symbol: text }))}
          autoCapitalize="characters"
        />
        {errors.symbol && <Text style={styles.errorText}>{errors.symbol}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Condition</Text>
        <View style={styles.conditionOptions}>
          {(Object.keys(CONDITION_LABELS) as TriggerConditionType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.conditionBtn, form.conditionType === type && styles.conditionBtnActive]}
              onPress={() => setForm(prev => ({ ...prev, conditionType: type }))}
            >
              <Text style={[styles.conditionBtnText, form.conditionType === type && styles.conditionBtnTextActive]}>
                {CONDITION_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.conditionType && <Text style={styles.errorText}>{errors.conditionType}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Target Value</Text>
        <TextInput
          style={[styles.input, errors.targetValue && styles.inputError]}
          placeholder="e.g. 150.50"
          value={form.targetValue}
          onChangeText={(text) => setForm(prev => ({ ...prev, targetValue: text }))}
          keyboardType="numeric"
        />
        {errors.targetValue && <Text style={styles.errorText}>{errors.targetValue}</Text>}
      </View>

      <TouchableOpacity 
        style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]} 
        onPress={handleSave}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Save Trigger</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50' },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginTop: 5 },
  formGroup: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '600', color: '#34495e', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50'
  },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 5 },
  conditionOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  conditionBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  conditionBtnActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  conditionBtnText: { color: '#34495e', fontSize: 14, fontWeight: '500' },
  conditionBtnTextActive: { color: '#fff' },
  submitBtn: {
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
