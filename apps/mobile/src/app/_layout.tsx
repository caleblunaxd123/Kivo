import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogBox, NativeModules } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../stores/auth.store';

// CRÍTICO para OAuth en Expo Go: señala al browser que la sesión completó
// cuando el deep link reabre la app tras el redirect de Google/Apple.
// Sin esto, openAuthSessionAsync nunca resuelve con 'success' en Android.
WebBrowser.maybeCompleteAuthSession();

// Suprimir el error inofensivo de expo-keep-awake en desarrollo
LogBox.ignoreLogs(['Unable to activate keep awake', 'keep awake']);

if (__DEV__) {
  // Interceptar ExceptionsManager antes de que muestre la pantalla roja
  const RCTExceptions = NativeModules.RCTExceptionsManager;
  if (RCTExceptions?.reportFatalException) {
    const origFatal = RCTExceptions.reportFatalException.bind(RCTExceptions);
    RCTExceptions.reportFatalException = (message: string, stack: any, id: number) => {
      if (message?.includes('keep awake')) return;
      origFatal(message, stack, id);
    };
  }
  if (RCTExceptions?.reportSoftException) {
    const origSoft = RCTExceptions.reportSoftException.bind(RCTExceptions);
    RCTExceptions.reportSoftException = (message: string, stack: any, id: number) => {
      if (message?.includes('keep awake')) return;
      origSoft(message, stack, id);
    };
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" backgroundColor="#F4F9FD" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
