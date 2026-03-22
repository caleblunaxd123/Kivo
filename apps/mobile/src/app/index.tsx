import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { SplashLoader } from '../components/common/SplashLoader';

const SPLASH_MIN_MS = 800;

// index.tsx — única responsabilidad: esperar auth y redirigir.
// El tour check vive en (app)/_layout.tsx para evitar race conditions.
export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (isLoading || !ready) return <SplashLoader />;
  if (!isAuthenticated)    return <Redirect href="/onboarding" />;
  return                          <Redirect href="/(app)" />;
}
