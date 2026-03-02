/**
 * ORI APP — Root Layout
 * Sets up: fonts, providers (QueryClient, Stripe, Toast), auth init, and navigation stack.
 */

import '../global.css';

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { ToastProvider } from '@/components/ui/Toast';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';

// Keep splash visible while we initialize
SplashScreen.preventAutoHideAsync();

// Singleton QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   1000 * 60 * 2, // 2 minutes
      retry:       2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize  = useAuthStore((s) => s.initialize);

  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Bold':    require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'PlayfairDisplay-Italic':  require('../assets/fonts/PlayfairDisplay-Italic.ttf'),
    'Inter-Regular':           require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium':            require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold':          require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold':              require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      initialize().finally(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [fontsLoaded, initialize]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier="merchant.com.oricompany.oriapp"
          >
            <ToastProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </ToastProvider>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
