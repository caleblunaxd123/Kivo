import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { COLORS } from '@kivo/shared';

// Root redirect — decides where to go on app launch
export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgBase, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.kivo500} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(app)" />;
}
