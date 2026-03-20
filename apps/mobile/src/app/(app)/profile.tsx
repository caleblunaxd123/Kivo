import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, ChevronRight } from 'lucide-react-native';
import { COLORS } from '@kivo/shared';
import { useAuthStore } from '../../stores/auth.store';
import { Avatar } from '../../components/common/Avatar';

export default function ProfileScreen() {
  const insets  = useSafeAreaInsets();
  const user    = useAuthStore(s => s.user);
  const signOut = useAuthStore(s => s.signOut);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {/* User card */}
      <View style={styles.userCard}>
        <Avatar name={user?.displayName ?? 'Usuario'} size="lg" colorHex={user?.colorHex} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.displayName ?? 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Settings sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <SettingRow label="Moneda por defecto" value={user?.preferredCurrency ?? 'USD'} />
        <SettingRow label="Idioma" value="Español" />
        <SettingRow label="Timezone" value={user?.timezone ?? 'Lima'} />
        <SettingRow label="Tema" value="Dark" isLast />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <NotifRow label="Nuevas entradas" defaultValue={true} />
        <NotifRow label="Pendientes sin resolver" defaultValue={true} />
        <NotifRow label="Resumen diario" defaultValue={false} isLast />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan</Text>
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Gratuito</Text>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Ver planes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.75}>
        <LogOut size={18} color={COLORS.error} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SettingRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      activeOpacity={0.7}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        <ChevronRight size={16} color={COLORS.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function NotifRow({ label, defaultValue, isLast = false }: { label: string; defaultValue: boolean; isLast?: boolean }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={setValue}
        trackColor={{ false: COLORS.bgElevated, true: COLORS.kivo500 }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.4 },

  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    margin: 16, padding: 16,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  userEmail: { fontSize: 13, color: COLORS.textSecondary },

  section: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: COLORS.textTertiary,
    letterSpacing: 0.5, textTransform: 'uppercase',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderTopWidth: 1, borderTopColor: COLORS.borderSubtle,
  },
  rowLast: {},
  rowLabel: { fontSize: 15, color: COLORS.textPrimary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, color: COLORS.textSecondary },

  planCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderTopWidth: 1, borderTopColor: COLORS.borderSubtle,
  },
  planLabel: { fontSize: 15, color: COLORS.textPrimary },
  upgradeBtn: {
    backgroundColor: COLORS.kivo600, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  upgradeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, padding: 14,
    backgroundColor: `${COLORS.error}12`,
    borderRadius: 14, borderWidth: 1, borderColor: `${COLORS.error}25`,
  },
  signOutText: { color: COLORS.error, fontSize: 15, fontWeight: '500' },
});
