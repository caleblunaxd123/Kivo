import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Modal,
  Pressable, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreHorizontal, AlertTriangle } from 'lucide-react-native';
import { COLORS, formatCurrency } from '@kivo/shared';
import type { ParsedEntry } from '@kivo/shared';
import { useGroupStore } from '../../../stores/group.store';
import { useAuthStore } from '../../../stores/auth.store';
import { MultimodalComposer } from '../../../components/composer/MultimodalComposer';
import { AvatarGroup } from '../../../components/common/Avatar';
import { TimelineView } from '../../../components/timeline/TimelineView';
import { SheetView } from '../../../components/sheet/SheetView';
import { BalanceView } from '../../../components/balance/BalanceView';
import { saveEntry } from '../../../services/entry.service';
import { createEntryFromPhoto } from '../../../services/entry.service';

type ActiveTab = 'timeline' | 'sheet' | 'balance';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const user     = useAuthStore(s => s.user);

  const {
    activeGroup, members, entries, pendingCount,
    setActiveGroup, addEntryOptimistic,
    archiveGroup, leaveGroup,
  } = useGroupStore();

  const [tab,          setTab]          = useState<ActiveTab>('sheet');
  const [menuVisible,  setMenuVisible]  = useState(false);
  const [isActioning,  setIsActioning]  = useState(false);

  useEffect(() => {
    if (id) setActiveGroup(id);
    return () => setActiveGroup(null);
  }, [id]);

  const group     = activeGroup;
  const isOwner   = group?.ownerId === user?.id;
  const totalAmount = entries
    .filter(e => e.status === 'confirmed')
    .reduce((sum, e) => sum + (e.amountInBase ?? e.amount), 0);

  const handleEntryConfirmed = useCallback(async (parsed: Partial<ParsedEntry>, rawInput: string) => {
    if (!id || !user) return;
    const entryData = {
      groupId: id,
      createdBy: user.id,
      origin: 'text' as const,
      type: parsed.type ?? 'expense',
      description: parsed.description ?? '',
      amount: parsed.amount ?? 0,
      currency: parsed.currency ?? (group?.baseCurrency ?? 'USD'),
      paidBy: parsed.paidBy === 'me' ? user.id : parsed.paidBy ?? undefined,
      splitRule: parsed.splitRule ?? 'equal',
      category: parsed.category ?? 'other',
      rawInput,
      pendingReasons: parsed.pendingReasons ?? [],
      aiConfidence: parsed.confidence,
      entryDate: new Date().toISOString().split('T')[0],
    };

    addEntryOptimistic(entryData);

    try {
      await saveEntry(entryData);
    } catch (e) {
      console.error('Failed to save entry:', e);
    }
  }, [id, user, group, addEntryOptimistic]);

  const handlePhotoSelected = useCallback(async (uri: string) => {
    if (!id || !user) return;
    try {
      await createEntryFromPhoto(uri, {
        groupId: id,
        members,
        defaultCurrency: group?.baseCurrency ?? 'USD',
        createdBy: user.id,
      });
    } catch (e) {
      console.error('Photo upload failed:', e);
    }
  }, [id, user, group, members]);

  const handlePendingPress = useCallback(() => {
    setTab('sheet');
    // The sheet view will show pending filter
  }, []);

  const handleArchiveGroup = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      'Archivar grupo',
      `¿Archivar "${group?.name}"? El grupo dejará de aparecer en tu lista. Los datos se conservan.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Archivar',
          style: 'destructive',
          onPress: async () => {
            setIsActioning(true);
            try {
              await archiveGroup(id);
              router.replace('/(app)');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo archivar');
            } finally {
              setIsActioning(false);
            }
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
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            setIsActioning(true);
            try {
              await leaveGroup(id);
              router.replace('/(app)');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo salir del grupo');
            } finally {
              setIsActioning(false);
            }
          },
        },
      ]
    );
  }, [group, id, leaveGroup, router]);

  const handleEntryPress = useCallback((entryId: string) => {
    router.push(`/(app)/group/entry/${entryId}`);
  }, [router]);

  if (!group) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando grupo…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.groupEmoji}>{group.coverEmoji}</Text>
          <View>
            <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
            <Text style={styles.groupMeta}>{members.length} miembros</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {pendingCount > 0 && (
            <TouchableOpacity style={styles.pendingBtn} onPress={handlePendingPress}>
              <AlertTriangle size={16} color={COLORS.warning} />
              <Text style={styles.pendingCount}>{pendingCount}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setMenuVisible(true)}
            disabled={isActioning}
          >
            {isActioning
              ? <ActivityIndicator size="small" color={COLORS.textSecondary} />
              : <MoreHorizontal size={20} color={COLORS.textSecondary} />
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Total strip ─── */}
      <View style={styles.totalStrip}>
        <View>
          <Text style={styles.totalLabel}>Total del grupo</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(totalAmount, group.baseCurrency)}
          </Text>
        </View>
        <AvatarGroup
          members={members.map(m => ({ name: m.displayName, colorHex: m.colorHex }))}
          size="sm"
          max={5}
        />
      </View>

      {/* ─── Tab bar ─── */}
      <View style={styles.tabBar}>
        {(['timeline', 'sheet', 'balance'] as ActiveTab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'timeline' ? 'Timeline' : t === 'sheet' ? 'Sheet ✦' : 'Balance'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Content ─── */}
      <View style={styles.content}>
        {tab === 'timeline' && (
          <TimelineView
            entries={entries}
            members={members}
            onEntryPress={handleEntryPress}
          />
        )}
        {tab === 'sheet' && (
          <SheetView
            entries={entries}
            members={members}
            groupId={id}
            onEntryPress={handleEntryPress}
            initialFilter={pendingCount > 0 && tab === 'sheet' ? undefined : undefined}
          />
        )}
        {tab === 'balance' && (
          <BalanceView groupId={id} baseCurrency={group.baseCurrency} />
        )}
      </View>

      {/* ─── Composer ─── */}
      <MultimodalComposer
        groupId={id}
        members={members}
        defaultCurrency={group.baseCurrency}
        onEntryConfirmed={handleEntryConfirmed}
        onPhotoSelected={handlePhotoSelected}
      />

      {/* ─── Group Menu Modal ─── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuSheet, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuGroupName}>{group.coverEmoji} {group.name}</Text>

            {isOwner ? (
              <TouchableOpacity style={styles.menuItemDanger} onPress={handleArchiveGroup}>
                <Text style={styles.menuItemDangerText}>Archivar grupo</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItemDanger} onPress={handleLeaveGroup}>
                <Text style={styles.menuItemDangerText}>Salir del grupo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItemCancel}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuItemCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary, fontSize: 15 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupEmoji: { fontSize: 28 },
  groupName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  groupMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pendingBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: `${COLORS.warning}30`,
  },
  pendingCount: { color: COLORS.warning, fontSize: 12, fontWeight: '700' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },

  // Total strip
  totalStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  totalLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  totalAmount: {
    fontSize: 28, fontWeight: '800', color: COLORS.textPrimary,
    fontFamily: 'monospace', letterSpacing: -1, marginTop: 2,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.kivo500 },
  tabText: { fontSize: 14, fontWeight: '500', color: COLORS.textTertiary },
  tabTextActive: { color: COLORS.kivo400, fontWeight: '600' },

  content: { flex: 1 },

  // Menu modal
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: COLORS.bgSurface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  menuHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: COLORS.borderDefault,
    alignSelf: 'center', marginBottom: 12,
  },
  menuGroupName: {
    fontSize: 15, fontWeight: '600', color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 8,
  },
  menuItemDanger: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: `${COLORS.error}12`,
    borderWidth: 1, borderColor: `${COLORS.error}25`,
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemDangerText: { color: COLORS.error, fontSize: 16, fontWeight: '600' },
  menuItemCancel: {
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1, borderColor: COLORS.borderDefault,
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemCancelText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '500' },
});
