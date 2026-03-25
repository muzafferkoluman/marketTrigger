import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { purchasePremium } from '../lib/revenuecat';

export default function PaywallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const success = await purchasePremium();
      if (success) {
        Alert.alert("Success!", "You are now a Premium member.", [
          { text: "Awesome", onPress: () => router.back() }
        ]);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MarketTrigger Premium</Text>
      <Text style={styles.description}>
        Free users can only have 3 active triggers. 
        Upgrade to Premium for unlimited active triggers and faster evaluation intervals!
      </Text>
      
      <View style={styles.priceCard}>
        <Text style={styles.price}>$4.99 / month</Text>
        <Text style={styles.priceSub}>Cancel anytime</Text>
      </View>

      <TouchableOpacity 
        style={styles.purchaseBtn} 
        onPress={handlePurchase}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.purchaseBtnText}>Upgrade Now</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreBtn} onPress={() => Alert.alert("Restored", "Purchases restored (mock)")}>
        <Text style={styles.restoreBtnText}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  description: { fontSize: 16, color: '#34495e', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  priceCard: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '100%'
  },
  price: { fontSize: 32, fontWeight: 'bold', color: '#27ae60' },
  priceSub: { fontSize: 14, color: '#7f8c8d', marginTop: 5 },
  purchaseBtn: { backgroundColor: '#3498db', padding: 18, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 20 },
  purchaseBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  restoreBtn: { padding: 15 },
  restoreBtnText: { color: '#7f8c8d', fontSize: 16, fontWeight: '600' }
});
