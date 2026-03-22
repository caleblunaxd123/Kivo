import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (isAuthenticated) return <Redirect href="/(app)" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
