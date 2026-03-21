import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Users, Activity, User } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth.store';
import { COLORS } from '@kivo/shared';

export default function AppLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.kivo400,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color, size }) => <Users size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Actividad',
          tabBarIcon: ({ color, size }) => <Activity size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Yo',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
      {/* Hidden screens — navigated to programmatically, no tab bar */}
      <Tabs.Screen
        name="group/[id]"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="group/create"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopColor: COLORS.borderSubtle,
    borderTopWidth: 1,
    height: 56,
    paddingBottom: 6,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
