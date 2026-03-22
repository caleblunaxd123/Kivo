import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, ChevronRight, Pencil, Check, X } from 'lucide-react-native';
import { CURRENCIES } from '@vozpe/shared';
import { useAuthStore } from '../../stores/auth.store';
import { Avatar } from '../../components/common/Avatar';
import { T } from '../../theme/tokens';

export default function ProfileScreen() {
  const insets        = useSafeAreaInsets();
  const user          = useAuthStore(s => s.user);
  const signOut       = useAuthStore(s => s.signOut);
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
    try { await updateProfile({ preferredCurrency: currency }); }
    catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo actualizar'); }
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
        style={[styles.root, { paddingTop: insets.top }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBlob} pointerEvents="none" />
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <Avatar name={user?.displayName ?? 'Usuario'} size="lg" colorHex={user?.colorHex ?? T.blue} />
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
                    ? <ActivityIndicator size="small" color={T.blue} />
                    : <Check size={18} color={T.green} />
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditingName(false); setNameInput(user?.displayName ?? ''); }} style={styles.nameAction}>
                  <X size={18} color={T.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.nameRow} onPress={() => { setNameInput(user?.displayName ?? ''); setEditingName(true); }}>
                <Text style={styles.userName}>{user?.displayName ?? 'Usuario'}</Text>
                <Pencil size={14} color={T.textMuted} />
              </TouchableOpacity>
            )}
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferencias</Text>
          <TouchableOpacity style={styles.row} onPress={() => setCurrencyModal(true)} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>Moneda por defecto</Text>
            <View style={styles.rowRight}>
              {(() => {
                const cur = CURRENCIES.find(c => c.code === (user?.preferredCurrency ?? 'USD'));
                return (
                  <>
                    {cur && <Text style={styles.rowFlag}>{cur.flag}</Text>}
                    <Text style={styles.rowValue}>{user?.preferredCurrency ?? 'USD'}</Text>
                  </>
                );
              })()}
              <ChevronRight size={16} color={T.textMuted} />
            </View>
          </TouchableOpacity>
          <View style={[styles.row, styles.rowBorderless]}>
            <Text style={styles.rowLabel}>Idioma</Text>
            <Text style={styles.rowValue}>Español</Text>
          </View>
        </View>

        {/* Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cuenta</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>ID de usuario</Text>
            <Text style={[styles.rowValue, styles.idText]} numberOfLines={1}>
              {user?.id?.slice(0, 8)}…
            </Text>
          </View>
          <View style={[styles.row, styles.rowBorderless]}>
            <Text style={styles.rowLabel}>Miembro desde</Text>
            <Text style={styles.rowValue}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es', { month: 'short', year: 'numeric' })
                : '—'}
            </Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.75}>
          <LogOut size={18} color={T.error} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Currency modal */}
      <Modal visible={currencyModal} transparent animationType="slide" onRequestClose={() => setCurrencyModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setCurrencyModal(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Moneda por defecto</Text>
            <Text style={styles.sheetSub}>Elige la moneda principal para tus grupos</Text>
            {CURRENCIES.map(c => {
              const active = user?.preferredCurrency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.currencyRow, active && styles.currencyRowActive]}
                  onPress={() => handleCurrencySelect(c.code)}
                  activeOpacity={0.72}
                >
                  <Text style={styles.currencyFlag}>{c.flag}</Text>
                  <View style={styles.currencyInfo}>
                    <Text style={[styles.currencyCode, active && styles.currencyCodeActive]}>{c.code}</Text>
                    <Text style={styles.currencyName}>{c.name}</Text>
                  </View>
                  <Text style={[styles.currencySymbol, active && styles.currencySymbolActive]}>{c.symbol}</Text>
                  {active && <Check size={16} color={T.blue} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.appBg },

  header: {
    backgroundColor: T.headerBg,
    paddingHorizontal: T.spMd, paddingVertical: T.spMd,
    borderBottomWidth: 1, borderBottomColor: T.strokeSoft,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: T.blue + '0C',
    top: -70, right: -50,
  },
  title: { fontSize: T.fsLg, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.4 },

  // User card
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    margin: T.spMd, padding: T.spMd,
    backgroundColor: T.cardBg,
    borderRadius: T.rCardLg, borderWidth: 1, borderColor: T.strokeSoft,
    ...T.shadowCard,
  },
  userInfo:    { flex: 1, gap: 4 },
  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameInput: {
    flex: 1, fontSize: T.fsLg, fontWeight: '700', color: T.textPrimary,
    borderBottomWidth: 2, borderBottomColor: T.blue,
    paddingVertical: 2,
  },
  nameAction: { padding: 4 },
  userName:   { fontSize: T.fsLg, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.3 },
  userEmail:  { fontSize: T.fsSm, color: T.textSecondary },

  // Sections
  section: {
    marginHorizontal: T.spMd, marginBottom: 10,
    backgroundColor: T.cardBg,
    borderRadius: T.rCard, borderWidth: 1, borderColor: T.strokeSoft,
    overflow: 'hidden',
    ...T.shadowXs,
  },
  sectionLabel: {
    fontSize: T.fsXs, fontWeight: '700', color: T.textMuted,
    letterSpacing: 0.7, textTransform: 'uppercase',
    paddingHorizontal: T.spMd, paddingTop: 14, paddingBottom: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: T.spMd, paddingVertical: 13,
    borderTopWidth: 1, borderTopColor: T.strokeSoft,
  },
  rowBorderless: { borderTopWidth: 0 },
  rowLabel: { fontSize: T.fsBase, color: T.textPrimary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: T.fsMd, color: T.textSecondary },
  rowFlag:  { fontSize: 16 },
  idText:   { fontFamily: 'monospace', fontSize: T.fsSm },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: T.spMd, padding: 14,
    backgroundColor: T.error + '12',
    borderRadius: T.rCard, borderWidth: 1, borderColor: T.error + '28',
  },
  signOutText: { color: T.error, fontSize: T.fsBase, fontWeight: '600' },

  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: T.cardBg,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingTop: 12, paddingHorizontal: T.spMd,
    maxHeight: '80%',
    ...T.shadowModal,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: T.strokeSoft,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17, fontWeight: '700', color: T.textPrimary,
    textAlign: 'center', marginBottom: 2,
  },
  sheetSub: {
    fontSize: T.fsSm, color: T.textMuted,
    textAlign: 'center', marginBottom: 14,
  },

  currencyRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 10,
    borderRadius: T.rCard, marginBottom: 4, gap: 12,
  },
  currencyRowActive: { backgroundColor: T.blue + '0E' },
  currencyFlag: { fontSize: 22 },
  currencyInfo: { flex: 1, gap: 1 },
  currencyCode: { fontSize: T.fsBase, color: T.textPrimary, fontWeight: '700' },
  currencyCodeActive: { color: T.blue },
  currencyName: { fontSize: T.fsSm, color: T.textMuted },
  currencySymbol: {
    fontSize: T.fsMd, color: T.textMuted, fontWeight: '600',
    fontFamily: 'monospace', marginRight: 4,
  },
  currencySymbolActive: { color: T.blue },
});
