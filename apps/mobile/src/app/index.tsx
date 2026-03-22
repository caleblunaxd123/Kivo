import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { SplashLoader } from '../components/common/SplashLoader';

// Root redirect — decides where to go on app launch
export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <SplashLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(app)" />;
}
