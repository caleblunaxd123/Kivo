import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Modal,
  Pressable, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreHorizontal, AlertTriangle, Users, Share2 } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
// expo-sharing requiere build nativo — import lazy para no crashear en Expo Go
let Sharing: typeof import('expo-sharing') | null = null;
try { Sharing = require('expo-sharing'); } catch {}
import { formatCurrency, COLORS } from '@vozpe/shared';
import { T } from '../../../theme/tokens';
import type { ParsedEntry } from '@vozpe/shared';
import { useGroupStore } from '../../../stores/group.store';
import { useAuthStore } from '../../../stores/auth.store';
import { MultimodalComposer } from '../../../components/composer/MultimodalComposer';
import { AvatarGroup } from '../../../components/common/Avatar';
import { TimelineView } from '../../../components/timeline/TimelineView';
import { SheetView } from '../../../components/sheet/SheetView';
import { BalanceView } from '../../../components/balance/BalanceView';
import { saveEntry, createEntryFromPhoto } from '../../../services/entry.service';

type ActiveTab = 'timeline' | 'sheet' | 'balance';

const TABS: { key: ActiveTab; label: string; suffix?: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'sheet',    label: 'Sheet', suffix: '✦' },
  { key: 'balance',  label: 'Balance' },
];

export default function GroupScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const user     = useAuthStore(s => s.user);

  const {
    activeGroup, members, entries, pendingCount,
    setActiveGroup, addEntryOptimistic, removeEntry,
    archiveGroup, leaveGroup,
  } = useGroupStore();

  const [tab,         setTab]         = useState<ActiveTab>('timeline');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    if (id) setActiveGroup(id);
    return () => setActiveGroup(null);
  }, [id]);

  const group   = activeGroup;
  const isOwner = group?.ownerId === user?.id;
  const totalAmount = useMemo(() =>
    entries
      .filter(e => e.status !== 'archived')
      .reduce((sum, e) => sum + (e.amountInBase ?? e.amount), 0),
    [entries]
  );

  const handleEntryConfirmed = useCallback(async (parsed: Partial<ParsedEntry>, rawInput: string) => {
    if (!id || !user) return;
    const entryData = {
      groupId:        id,
      createdBy:      user.id,
      origin:         'text' as const,
      type:           parsed.type ?? 'expense',
      description:    parsed.description ?? '',
      amount:         parsed.amount ?? 0,
      currency:       (parsed.currency && /^[A-Z]{3}$/.test(parsed.currency.trim().toUpperCase()))
                        ? parsed.currency.trim().toUpperCase()
                        : (group?.baseCurrency ?? 'USD'),
      paidBy:         parsed.paidBy === 'me' ? user.id : parsed.paidBy ?? undefined,
      splitRule:      parsed.splitRule ?? 'equal',
      category:       parsed.category ?? 'other',
      rawInput,
      pendingReasons: parsed.pendingReasons ?? [],
      aiConfidence:   parsed.confidence,
      entryDate:      parsed.entryDate ?? new Date().toISOString().split('T')[0],
    };
    const tempId = addEntryOptimistic(entryData);
    try {
      await saveEntry(entryData);
    } catch (e: any) {
      console.error('saveEntry failed:', e);
      removeEntry(tempId);
      Alert.alert('Error al guardar', e?.message ?? 'No se pudo guardar la entrada. Intenta de nuevo.');
    }
  }, [id, user, group, addEntryOptimistic]);

  const handlePhotoSelected = useCallback(async (uri: string) => {
    if (!id || !user) return;
    try {
      await createEntryFromPhoto(uri, {
        groupId: id, members,
        defaultCurrency: group?.baseCurrency ?? 'USD',
        createdBy: user.id,
      });
    } catch (e: any) {
      console.error('Photo upload failed:', e);
      Alert.alert('Error con la foto', e?.message ?? 'No se pudo procesar la imagen. Intenta de nuevo.');
    }
  }, [id, user, group, members]);

  const handleArchiveGroup = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      'Archivar grupo',
      `¿Archivar "${group?.name}"? Los datos se conservan, pero el grupo desaparecerá de tu lista.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Archivar', style: 'destructive',
          onPress: async () => {
            setIsActioning(true);
            try { await archiveGroup(id); router.replace('/(app)'); }
            catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo archivar'); }
            finally { setIsActioning(false); }
          },
        },
      ]
    );
  }, [group, id, archiveGroup, router]);

  const handleLeaveGroup = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      'Salir del grupo',
      `¿Salir de "${group?.name}"? Ya no podrás ver ni agregar entradas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir', style: 'destructive',
          onPress: async () => {
            setIsActioning(true);
            try { await leaveGroup(id); router.replace('/(app)'); }
            catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo salir del grupo'); }
            finally { setIsActioning(false); }
          },
        },
      ]
    );
  }, [group, id, leaveGroup, router]);

  const handleEntryPress = useCallback((entryId: string) => {
    router.push(`/(app)/group/entry/${entryId}`);
  }, [router]);

  const handleExport = useCallback(async () => {
    setMenuVisible(false);
    try {
      if (!Sharing) {
        Alert.alert('No disponible', 'La función de exportar requiere una build nativa.');
        return;
      }
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('No disponible', 'El compartir no está disponible en este dispositivo.');
        return;
      }

      // Build CSV
      const header = 'Fecha,Descripción,Tipo,Monto,Moneda,Pagado por,Categoría,Estado';
      const rows = entries.map(e => {
        const paidMember = members.find(m => m.id === e.paidBy);
        const cols = [
          e.entryDate ?? '',
          `"${(e.description ?? '').replace(/"/g, '""')}"`,
          e.type ?? 'expense',
          e.amount?.toString() ?? '0',
          e.currency ?? group?.baseCurrency ?? '',
          `"${paidMember?.displayName ?? e.paidBy ?? ''}"`,
          e.category ?? '',
          e.status ?? '',
        ];
        return cols.join(',');
      });
      const csv = [header, ...rows].join('\n');

      const filename = `${(group?.name ?? 'grupo').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

      await Sharing.shareAsync(path, {
        mimeType: 'text/csv',
        dialogTitle: `Exportar ${group?.name ?? 'grupo'}`,
        UTI: 'public.comma-separated-values-text',
      });
    } catch (e: any) {
      Alert.alert('Error al exportar', e?.message ?? 'No se pudo exportar el archivo.');
    }
  }, [entries, members, group]);

  if (!group) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loading}>
          <ActivityIndicator color={T.blue} />
          <Text style={styles.loadingText}>Cargando grupo…</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >

      {/* ── Header banner (colored) ── */}
      <View style={styles.headerBanner}>
        {/* Decorative orb */}
        <View style={styles.bannerOrb} />

        {/* Top row: back + menu */}
        <View style={styles.bannerTopRow}>
          <TouchableOpacity style={styles.bannerIconBtn} onPress={() => router.back()}>
            <ChevronLeft size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <View style={styles.bannerRight}>
            {pendingCount > 0 && (
              <TouchableOpacity style={styles.pendingBtnBanner} onPress={() => setTab('sheet')}>
                <AlertTriangle size={12} color="#fff" />
                <Text style={styles.pendingCountBanner}>{pendingCount}</Text>
              </TouchableOpacity>
            )}
            {/* Botón compartir directo — sin abrir el menú */}
            <TouchableOpacity
              style={styles.bannerIconBtn}
              onPress={handleExport}
              accessibilityLabel="Exportar y compartir"
            >
              <Share2 size={18} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bannerIconBtn}
              onPress={() => setMenuVisible(true)}
              disabled={isActioning}
            >
              {isActioning
                ? <ActivityIndicator size="small" color="#fff" />
                : <MoreHorizontal size={20} color="rgba(255,255,255,0.9)" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Group identity */}
        <View style={styles.bannerIdentity}>
          <View style={styles.bannerEmojiWrap}>
            <Text style={styles.bannerEmoji}>{group.coverEmoji}</Text>
          </View>
          <View>
            <Text style={styles.bannerGroupName} numberOfLines={1}>{group.name}</Text>
            <View style={styles.bannerMembersRow}>
              <Users size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.bannerMeta}>
                {members.length} miembro{members.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Balance cards */}
        <View style={styles.bannerCards}>
          <View style={styles.bannerCard}>
            <Text style={styles.bannerCardLabel}>Total del grupo</Text>
            <Text style={styles.bannerCardAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {formatCurrency(totalAmount, group.baseCurrency)}
            </Text>
            <AvatarGroup
              members={members.map(m => ({ name: m.displayName, colorHex: m.colorHex }))}
              size="xs"
              max={4}
            />
          </View>
          <View style={[styles.bannerCard, styles.bannerCardDark]}>
            <Text style={styles.bannerCardLabel}>Entradas</Text>
            <Text style={styles.bannerCardAmount}>{entries.length}</Text>
            <Text style={styles.bannerCardSub}>
              {pendingCount > 0 ? `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}` : 'todo confirmado'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}{t.suffix ? ` ${t.suffix}` : ''}
            </Text>
            {tab === t.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {tab === 'timeline' && (
          <TimelineView entries={entries} members={members} onEntryPress={handleEntryPress} />
        )}
        {tab === 'sheet' && (
          <SheetView
            entries={entries} members={members}
            groupId={id} baseCurrency={group.baseCurrency}
            onEntryPress={handleEntryPress}
          />
        )}
        {tab === 'balance' && (
          <BalanceView groupId={id} baseCurrency={group.baseCurrency} />
        )}
      </View>

      {/* ── Composer ── */}
      <MultimodalComposer
        groupId={id}
        members={members}
        defaultCurrency={group.baseCurrency}
        onEntryConfirmed={handleEntryConfirmed}
        onPhotoSelected={handlePhotoSelected}
      />

      {/* ── Group Menu Modal ── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={[styles.menuSheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuGroupName}>{group.coverEmoji} {group.name}</Text>

            {/* Export / Share */}
            <TouchableOpacity style={styles.menuItemExport} onPress={handleExport}>
              <Share2 size={16} color={COLORS.kivo500} />
              <Text style={styles.menuItemExportText}>Exportar y compartir (CSV / Excel)</Text>
            </TouchableOpacity>

            {isOwner ? (
              <TouchableOpacity style={styles.menuItemDanger} onPress={handleArchiveGroup}>
                <Text style={styles.menuItemDangerText}>Archivar grupo</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItemDanger} onPress={handleLeaveGroup}>
                <Text style={styles.menuItemDangerText}>Salir del grupo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItemCancel} onPress={() => setMenuVisible(false)}>
              <Text style={styles.menuItemCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.appBg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: T.textSecondary, fontSize: 14 },

  // ── Header banner — azul brand ────────────────────────────────
  headerBanner: {
    backgroundColor: T.blue,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
    overflow: 'hidden',
    shadowColor: T.blueDeep,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  bannerOrb: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.09)',
    top: -120, right: -80,
  },
  bannerTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 8,
  },
  bannerIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingBtnBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: T.warning,
    borderRadius: T.rChip, paddingHorizontal: 10, paddingVertical: 5,
  },
  pendingCountBanner: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bannerIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerEmojiWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerEmoji: { fontSize: 24 },
  bannerGroupName: {
    fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.5,
  },
  bannerMembersRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  bannerMeta: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  bannerCards: { flexDirection: 'row', gap: 10 },
  bannerCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: T.rCard, padding: 14, gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
  },
  bannerCardDark: {
    backgroundColor: T.green + '28',
    borderColor: T.green + '30',
  },
  bannerCardLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.7)',
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4,
  },
  bannerCardAmount: {
    fontSize: 20, fontWeight: '800',
    color: '#fff', fontFamily: 'monospace', letterSpacing: -0.6,
  },
  bannerCardSub: { fontSize: 11, color: 'rgba(255,255,255,0.68)', fontWeight: '500' },

  // ── Tab bar ──────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: T.cardBg,
    borderBottomWidth: 1, borderBottomColor: T.strokeSoft,
  },
  tab: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText:       { fontSize: 13, fontWeight: '500', color: T.textMuted },
  tabTextActive: { color: T.blue, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2.5, borderRadius: 2,
    backgroundColor: T.blue,
  },

  content: { flex: 1 },

  // ── Menu modal ───────────────────────────────────────────────
  menuOverlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: T.cardBg,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingTop: 12, paddingHorizontal: 16, gap: 8,
    ...T.shadowModal,
  },
  menuHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: T.strokeSoft,
    alignSelf: 'center', marginBottom: 12,
  },
  menuGroupName: {
    fontSize: 15, fontWeight: '600', color: T.textSecondary,
    textAlign: 'center', marginBottom: 8,
  },
  menuItemExport: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15, borderRadius: T.rCard,
    backgroundColor: T.blue + '0E',
    borderWidth: 1, borderColor: T.blue + '28',
    marginBottom: 4,
  },
  menuItemExportText: { color: T.blue, fontSize: 15, fontWeight: '600' },
  menuItemDanger: {
    paddingVertical: 15, borderRadius: T.rCard,
    backgroundColor: T.error + '10',
    borderWidth: 1, borderColor: T.error + '30',
    alignItems: 'center', marginBottom: 4,
  },
  menuItemDangerText: { color: T.error, fontSize: 15, fontWeight: '600' },
  menuItemCancel: {
    paddingVertical: 14, borderRadius: T.rCard,
    backgroundColor: T.blueSoft,
    borderWidth: 1, borderColor: T.strokeSoft,
    alignItems: 'center', marginBottom: 4,
  },
  menuItemCancelText: { color: T.textSecondary, fontSize: 15, fontWeight: '500' },
});
