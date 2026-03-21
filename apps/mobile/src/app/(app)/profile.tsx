import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, ChevronRight, Pencil, Check, X } from 'lucide-react-native';
import { COLORS } from '@kivo/shared';
import { useAuthStore } from '../../stores/auth.store';
import { Avatar } from '../../components/common/Avatar';

const CURRENCIES = ['USD', 'EUR', 'PEN', 'ARS', 'CLP', 'COP', 'MXN', 'BRL'];

export default function ProfileScreen() {
  const insets       = useSafeAreaInsets();
  const user         = useAuthStore(s => s.user);
  const signOut      = useAuthStore(s => s.signOut);
  const updateProfile = useAuthStore(s => s.updateProfile);

  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState(user?.displayName ?? '');
  const [isSaving,    setIsSaving]    = useState(false);

  const [currencyModal, setCurrencyModal] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile({ displayName: nameInput.trim() });
      setEditingName(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencySelect = async (currency: string) => {
    setCurrencyModal(false);
    try {
      await updateProfile({ preferredCurrency: currency });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <>
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
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                  selectTextOnFocus
                />
                <TouchableOpacity onPress={handleSaveName} disabled={isSaving} style={styles.nameAction}>
                  {isSaving
                    ? <ActivityIndicator size="small" color={COLORS.kivo400} />
                    : <Check size={18} color={COLORS.success} />
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditingName(false); setNameInput(user?.displayName ?? ''); }} style={styles.nameAction}>
                  <X size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.nameRow} onPress={() => { setNameInput(user?.displayName ?? ''); setEditingName(true); }}>
                <Text style={styles.userName}>{user?.displayName ?? 'Usuario'}</Text>
                <Pencil size={14} color={COLORS.textTertiary} />
              </TouchableOpacity>
            )}
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setCurrencyModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Moneda por defecto</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{user?.preferredCurrency ?? 'USD'}</Text>
              <ChevronRight size={16} color={COLORS.textTertiary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Idioma</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>Español</Text>
            </View>
          </View>
        </View>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>ID de usuario</Text>
            <Text style={[styles.rowValue, styles.idText]} numberOfLines={1}>
              {user?.id?.slice(0, 8)}…
            </Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Miembro desde</Text>
            <Text style={styles.rowValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es', { month: 'short', year: 'numeric' }) : '—'}
            </Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.75}>
          <LogOut size={18} color={COLORS.error} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Currency picker modal */}
      <Modal visible={currencyModal} transparent animationType="slide" onRequestClose={() => setCurrencyModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCurrencyModal(false)}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Moneda por defecto</Text>
            {CURRENCIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.currencyRow, user?.preferredCurrency === c && styles.currencyRowActive]}
                onPress={() => handleCurrencySelect(c)}
              >
                <Text style={[styles.currencyText, user?.preferredCurrency === c && styles.currencyTextActive]}>
                  {c}
                </Text>
                {user?.preferredCurrency === c && <Check size={16} color={COLORS.kivo400} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
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
  userInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameInput: {
    flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary,
    borderBottomWidth: 2, borderBottomColor: COLORS.kivo500,
    paddingVertical: 2,
  },
  nameAction: { padding: 4 },
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
  idText: { fontFamily: 'monospace', fontSize: 12 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, padding: 14,
    backgroundColor: `${COLORS.error}12`,
    borderRadius: 14, borderWidth: 1, borderColor: `${COLORS.error}25`,
  },
  signOutText: { color: COLORS.error, fontSize: 15, fontWeight: '500' },

  // Currency modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.bgSurface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingHorizontal: 16,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: COLORS.borderDefault,
    alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 12,
  },
  currencyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 10, marginBottom: 4,
  },
  currencyRowActive: { backgroundColor: `${COLORS.kivo500}15` },
  currencyText: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' },
  currencyTextActive: { color: COLORS.kivo400, fontWeight: '700' },
});
