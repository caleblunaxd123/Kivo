import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { SplashLoader } from '../components/common/SplashLoader';

const SPLASH_MIN_MS = 800; // mínimo para que el splash sea visible sin sentirse lento

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (isLoading || !minTimeElapsed) {
    return <SplashLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(app)" />;
}
