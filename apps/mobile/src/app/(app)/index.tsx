import React, { useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Bell } from 'lucide-react-native';
import { COLORS, formatCurrency, GROUP_TYPE_CONFIG } from '@kivo/shared';
import type { Group } from '@kivo/shared';
import { useGroupStore } from '../../stores/group.store';
import { useAuthStore } from '../../stores/auth.store';
import { EmptyState } from '../../components/common/EmptyState';
import { AvatarGroup } from '../../components/common/Avatar';

export default function GroupsHomeScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const user    = useAuthStore(s => s.user);
  const { groups, isLoadingGroups, fetchGroups } = useGroupStore();

  useEffect(() => { fetchGroups(); }, []);

  const onRefresh = useCallback(() => { fetchGroups(); }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hola, {user?.displayName?.split(' ')[0] ?? 'ahí'} 👋
          </Text>
          <Text style={styles.subtitle}>
            {groups.length > 0
              ? `${groups.length} grupo${groups.length !== 1 ? 's' : ''} activo${groups.length !== 1 ? 's' : ''}`
              : 'Sin grupos activos'}
          </Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Group list */}
      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        contentContainerStyle={groups.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingGroups}
            onRefresh={onRefresh}
            tintColor={COLORS.kivo500}
          />
        }
        ListEmptyComponent={
          !isLoadingGroups ? (
            <EmptyState
              emoji="✨"
              title="Tu primer grupo te espera"
              subtitle="Crea uno para organizar un viaje, compras, eventos o lo que necesites."
              ctaLabel="Crear grupo"
              onCta={() => router.push('/(app)/group/create')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() => router.push(`/(app)/group/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 68 }]}
        onPress={() => router.push('/(app)/group/create')}
        activeOpacity={0.85}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const typeConfig = GROUP_TYPE_CONFIG[group.type] ?? GROUP_TYPE_CONFIG.general;
  const members = group.members ?? [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Cover strip */}
      <View style={styles.cardStrip}>
        <Text style={styles.cardEmoji}>{group.coverEmoji}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{group.name}</Text>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{typeConfig.label}</Text>
            </View>
          </View>

          <Text style={styles.cardAmount}>
            {formatCurrency(group.totalAmount ?? 0, group.baseCurrency)}
          </Text>
        </View>

        <View style={styles.cardBottom}>
          <AvatarGroup
            members={members.map(m => ({
              name: m.displayName,
              colorHex: m.colorHex,
            }))}
            size="xs"
            max={5}
          />
          {(group.pendingCount ?? 0) > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{group.pendingCount} pendientes</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },

  list: { padding: 16 },
  emptyContainer: { flex: 1, paddingHorizontal: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
  },
  cardStrip: {
    width: 56,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.borderSubtle,
  },
  cardEmoji: { fontSize: 24 },
  cardContent: { flex: 1, padding: 14, gap: 10 },
  cardTop: { gap: 4 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16, fontWeight: '600',
    letterSpacing: -0.2, flex: 1,
  },
  typeChip: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  typeChipText: { color: COLORS.textTertiary, fontSize: 11, fontWeight: '500' },
  cardAmount: {
    color: COLORS.textPrimary,
    fontSize: 20, fontWeight: '700',
    fontFamily: 'monospace', letterSpacing: -0.5,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingBadge: {
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: `${COLORS.warning}40`,
  },
  pendingBadgeText: { color: COLORS.warning, fontSize: 11, fontWeight: '500' },

  fab: {
    position: 'absolute',
    right: 20,
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.kivo500,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.kivo500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
