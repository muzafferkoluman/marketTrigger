import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuthStore } from '../../store/useAuthStore';
import { getSubscriptionStatus } from '../../lib/revenuecat';
import { SubscriptionPlan } from '../../types';
import { APP_CONFIG } from '../../constants';

// For this MVP, we fetch active count separately. If managed globally, you can put it in Zustand.
const MOCK_ACTIVE_TRIGGERS = 1;

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPlan = async () => {
      // In a real app, you would retrieve RevenueCat status here globally or in AuthStore
      const currentPlan = await getSubscriptionStatus();
      setPlan(currentPlan);
      setLoading(false);
    };
    checkPlan();
  }, [user]);

  if (loading) {
    return <View style={styles.container}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current Plan</Text>
        <Text style={[styles.value, plan === 'premium' && styles.premiumValue]}>
          {plan.toUpperCase()}
        </Text>
        
        {plan === 'free' && (
          <Text style={styles.subtext}>
            {APP_CONFIG.FREE_TRIGGER_LIMIT - MOCK_ACTIVE_TRIGGERS} triggers remaining
          </Text>
        )}
      </View>

      {plan === 'free' && (
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Unlock Unlimited Features</Text>
          <Text style={styles.ctaBody}>Premium members can set unlimited price alerts and get faster evaluation speeds.</Text>
          <TouchableOpacity 
            style={styles.upgradeBtn} 
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20
  },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  value: { fontSize: 22, fontWeight: 'bold', color: '#2ecc71' },
  premiumValue: { color: '#9b59b6' },
  subtext: { fontSize: 14, color: '#e67e22', marginTop: 10, fontWeight: '500' },
  ctaBox: { backgroundColor: '#e8f4fd', borderRadius: 12, padding: 20, marginTop: 10 },
  ctaTitle: { fontSize: 18, fontWeight: 'bold', color: '#2980b9', marginBottom: 5 },
  ctaBody: { fontSize: 14, color: '#34495e', marginBottom: 15, lineHeight: 20 },
  upgradeBtn: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
