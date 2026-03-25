import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Mock state for the UI shell
const MOCK_USER = {
  plan: 'Free',
  activeTriggers: 1,
  limit: 3
};

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current Plan</Text>
        <Text style={styles.value}>{MOCK_USER.plan}</Text>
        
        {MOCK_USER.plan === 'Free' && (
          <Text style={styles.subtext}>
            {MOCK_USER.limit - MOCK_USER.activeTriggers} triggers remaining
          </Text>
        )}
      </View>

      {MOCK_USER.plan === 'Free' && (
        <TouchableOpacity 
          style={styles.upgradeBtn} 
          onPress={() => router.push('/paywall')}
        >
          <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
        </TouchableOpacity>
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
  subtext: { fontSize: 14, color: '#e67e22', marginTop: 10, fontWeight: '500' },
  upgradeBtn: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
