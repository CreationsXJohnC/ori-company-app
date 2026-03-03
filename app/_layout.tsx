/**
 * ORI APP — Root Layout
 * Sets up: fonts, providers (QueryClient, Stripe, Toast), auth init, and navigation stack.
 */

import '../global.css';

import React, { useEffect, useRef } from 'react';
import { Platform, View, Text, ScrollView, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Archivo_100Thin,
  Archivo_300Light,
  Archivo_400Regular,
  Archivo_400Regular_Italic,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { ToastProvider } from '@/components/ui/Toast';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

// ─── Error Boundary ──────────────────────────────────────────────────────────
// Catches React render errors and displays them visually so we can debug
// the blank-screen issue on web.
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: '#1a0000' }}
          contentContainerStyle={{ padding: 24, paddingTop: 60 }}
        >
          <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            App Error (web debug)
          </Text>
          <Text style={{ color: '#ffcccc', fontSize: 13, lineHeight: 20 }}>
            {String(this.state.error)}
            {'\n\n'}
            {this.state.error.stack ?? ''}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

// Keep splash visible while we initialize
SplashScreen.preventAutoHideAsync();

// Load Stripe only on native — the SDK uses native modules unavailable in the browser.
type StripeProviderProps = React.PropsWithChildren<{ publishableKey: string; merchantIdentifier?: string }>;
const StripeProvider: React.ComponentType<StripeProviderProps> | null =
  Platform.OS !== 'web'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ? (require('@stripe/stripe-react-native') as { StripeProvider: React.ComponentType<StripeProviderProps> }).StripeProvider
    : null;

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
    'Archivo-Thin':     Archivo_100Thin,
    'Archivo-Light':    Archivo_300Light,
    'Archivo-Regular':  Archivo_400Regular,
    'Archivo-Italic':   Archivo_400Regular_Italic,
    'Archivo-Medium':   Archivo_500Medium,
    'Archivo-SemiBold': Archivo_600SemiBold,
    'Archivo-Bold':     Archivo_700Bold,
  });

  // Guard against calling initialize() more than once (e.g. on web where we
  // don't block on font loading and fontsLoaded may change after mount).
  const hasInitialized = useRef(false);

  useEffect(() => {
    // On web: initialize immediately without waiting for fonts so the auth
    // state resolves and the spinner clears even if font loading stalls.
    const ready = fontsLoaded || Platform.OS === 'web';
    if (ready && !hasInitialized.current) {
      hasInitialized.current = true;
      initialize().finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
    }
  }, [fontsLoaded, initialize]);

  // Handle oriapp:// deep links on native — exchange the PKCE code that
  // Supabase appends to the email confirmation redirect URL.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const exchangeCode = async (url: string) => {
      const code = url.match(/[?&]code=([^&]+)/)?.[1];
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };

    // App opened cold from the deep link
    Linking.getInitialURL().then((url) => { if (url) exchangeCode(url); });

    // App already running and received a deep link
    const sub = Linking.addEventListener('url', ({ url }) => exchangeCode(url));
    return () => sub.remove();
  }, []);

  // On web, SplashScreen may not work — render immediately regardless
  if (!fontsLoaded && Platform.OS !== 'web') return null;

  // Only mount StripeProvider on native or when a real key is configured
  const stripeReady = Platform.OS !== 'web' && STRIPE_PUBLISHABLE_KEY.length > 20;

  const children = (
    <ToastProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ToastProvider>
  );

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            {stripeReady && StripeProvider
              ? React.createElement(StripeProvider, {
                  publishableKey: STRIPE_PUBLISHABLE_KEY,
                  merchantIdentifier: 'merchant.com.oricompany.oriapp',
                }, children)
              : children}
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
