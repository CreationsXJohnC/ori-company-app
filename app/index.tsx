/**
 * ORI APP — Entry Point
 * Redirects to (auth) or (tabs) based on session state.
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => !!s.session);
  const isInitialized   = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) {
    return <LoadingSpinner full />;
  }

  return isAuthenticated
    ? <Redirect href="/(tabs)/menu" />
    : <Redirect href="/(auth)/welcome" />;
}
