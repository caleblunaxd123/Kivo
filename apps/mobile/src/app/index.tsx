import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/auth.store';
import { SplashLoader } from '../components/common/SplashLoader';

const SPLASH_MIN_MS = 800;

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [minTimeElapsed, setMinTimeElapsed]   = useState(false);
  const [tourChecked, setTourChecked]         = useState(false);
  const [tourDone, setTourDone]               = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  // Verificar tour una vez que sabemos que está autenticado
  useEffect(() => {
    if (!isAuthenticated) { setTourChecked(true); return; }
    AsyncStorage.getItem('vozpe_tour_done').then(done => {
      setTourDone(!!done);
      setTourChecked(true);
    });
  }, [isAuthenticated]);

  // Mostrar splash mientras: auth carga, tiempo mínimo, o tour check pendiente
  if (isLoading || !minTimeElapsed || !tourChecked) {
    return <SplashLoader />;
  }

  if (!isAuthenticated)  return <Redirect href="/onboarding" />;
  if (!tourDone)         return <Redirect href="/(auth)/welcome" />;
  return                        <Redirect href="/(app)" />;
}
