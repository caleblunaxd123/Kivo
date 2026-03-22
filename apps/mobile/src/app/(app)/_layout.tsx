import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Users, Activity, User } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth.store';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { T } from '../../theme/tokens';

export default function AppLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  useOfflineQueue();

  if (!isAuthenticated) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: T.blue,
        tabBarInactiveTintColor: T.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color, size }) => <Users size={size - 2} color={color} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Actividad',
          tabBarIcon: ({ color, size }) => <Activity size={size - 2} color={color} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Yo',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} strokeWidth={1.9} />,
        }}
      />
      {/* Pantallas ocultas — sin tab */}
      <Tabs.Screen name="group/[id]"          options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="group/create"        options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="group/entry/[entryId]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: T.strokeSoft,
    height: 58,
    paddingBottom: 6,
    paddingTop: 2,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: T.cardBg,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
