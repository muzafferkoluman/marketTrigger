import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '../hooks/use-color-scheme';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { registerForPushNotificationsAsync } from '../lib/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setUser, signInAnon } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        registerForPushNotificationsAsync(user.uid);
      } else {
        signInAnon(); // Auto sign-in anonymously for MVP
      }
    });
    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ presentation: 'modal', title: 'Search Stock' }} />
          <Stack.Screen name="create" options={{ presentation: 'modal', title: 'Create Trigger' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', title: 'Premium' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
