import React, { useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Bell, TrendingUp, Layers, ChevronRight } from 'lucide-react-native';
import { COLORS, formatCurrency, GROUP_TYPE_CONFIG, generateInitials } from '@vozpe/shared';
import type { Group } from '@vozpe/shared';
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

  const totalAcrossGroups = groups.reduce(
    (sum, g) => sum + (g.totalAmount ?? 0), 0
  );

  const firstName    = user?.displayName?.split(' ')[0] ?? 'ahí';
  const initials     = generateInitials(user?.displayName ?? 'K');
  const avatarColor  = user?.colorHex ?? COLORS.vozpe500;

  const hour = new Date().getHours();
  const greetingText = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header con gradiente visual ── */}
      <View style={styles.headerCard}>
        {/* Orbe decorativo */}
        <View style={styles.headerOrb} />

        <View style={styles.headerTop}>
          {/* Avatar + Greeting */}
          <View style={styles.headerLeft}>
            <View style={[styles.userAvatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.userAvatarText}>{initials}</Text>
            </View>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingSmall}>{greetingText}</Text>
              <Text style={styles.greeting}>{firstName} 👋</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notifBtn}>
            <Bell size={18} color={COLORS.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* Stats cards */}
        {groups.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Layers size={14} color={COLORS.vozpe400} />
              </View>
              <View>
                <Text style={styles.statValue}>{groups.length}</Text>
                <Text style={styles.statLabel}>grupos activos</Text>
              </View>
            </View>

            <View style={styles.statCardAccent}>
              <View style={styles.statIconWrapAccent}>
                <TrendingUp size={14} color="#fff" />
              </View>
              <View>
                <Text style={styles.statValueAccent} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {formatCurrency(totalAcrossGroups, user?.preferredCurrency ?? 'USD')}
                </Text>
                <Text style={styles.statLabelAccent}>total registrado</Text>
              </View>
            </View>
          </View>
        )}

        {/* Title row */}
        <Text style={styles.sectionTitle}>
          {groups.length > 0 ? 'Tus grupos' : 'Empieza aquí'}
        </Text>
      </View>

      {/* ── Group list ── */}
      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        contentContainerStyle={groups.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingGroups}
            onRefresh={onRefresh}
            tintColor={COLORS.vozpe500}
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

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 70 }]}
        onPress={() => router.push('/(app)/group/create')}
        activeOpacity={0.85}
      >
        <Plus size={22} color={COLORS.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const typeConfig = GROUP_TYPE_CONFIG[group.type] ?? GROUP_TYPE_CONFIG.general;
  const members    = group.members ?? [];
  const hasPending = (group.pendingCount ?? 0) > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.72}>
      {/* Left accent bar */}
      <View style={styles.cardAccentBar} />

      {/* Emoji column */}
      <View style={styles.cardEmojiCol}>
        <View style={styles.cardEmojiWrap}>
          <Text style={styles.cardEmoji}>{group.coverEmoji}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          {/* Title row */}
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{group.name}</Text>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{typeConfig.label}</Text>
            </View>
          </View>

          {/* Amount */}
          <Text style={styles.cardAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {formatCurrency(group.totalAmount ?? 0, group.baseCurrency)}
          </Text>
        </View>

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <AvatarGroup
            members={members.map(m => ({
              name: m.displayName,
              colorHex: m.colorHex,
            }))}
            size="xs"
            max={5}
          />
          {hasPending && (
            <View style={styles.pendingBadge}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingBadgeText}>
                {group.pendingCount} pendiente{(group.pendingCount ?? 0) !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight size={18} color={COLORS.textTertiary} style={styles.cardChevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },

  // ── Header card ──────────────────────────────────────────────
  headerCard: {
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    overflow: 'hidden',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerOrb: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: `${COLORS.vozpe500}18`,
    top: -80, right: -60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)',
  },
  userAvatarText: {
    color: '#fff', fontSize: 16, fontWeight: '800',
  },
  greetingCol: { gap: 1 },
  greetingSmall: {
    fontSize: 11, color: COLORS.textTertiary, fontWeight: '500',
  },
  greeting: {
    fontSize: 18, fontWeight: '700',
    color: COLORS.textPrimary, letterSpacing: -0.3,
  },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  statCardAccent: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.vozpe600,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: COLORS.vozpe500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: `${COLORS.vozpe500}20`,
    alignItems: 'center', justifyContent: 'center',
  },
  statIconWrapAccent: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: {
    fontSize: 17, fontWeight: '800',
    color: COLORS.textPrimary, fontFamily: 'monospace',
  },
  statValueAccent: {
    fontSize: 17, fontWeight: '800',
    color: '#fff', fontFamily: 'monospace', letterSpacing: -0.5,
  },
  statLabel:       { fontSize: 10, color: COLORS.textTertiary, fontWeight: '500' },
  statLabelAccent: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  sectionTitle: {
    fontSize: 13, fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // ── List ─────────────────────────────────────────────────────
  list:           { padding: 16 },
  emptyContainer: { flex: 1, paddingHorizontal: 16 },

  // ── Card ─────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    overflow: 'hidden',
    // Shadow — subtle on light bg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccentBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: COLORS.vozpe500,
    opacity: 0.7,
  },
  cardEmojiCol: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  cardEmojiWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  cardEmoji: { fontSize: 20 },

  cardContent: { flex: 1, paddingVertical: 14, paddingRight: 4, gap: 8 },
  cardTop: { gap: 3 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingRight: 4,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 15, fontWeight: '700',
    letterSpacing: -0.2, flex: 1,
  },
  typeChip: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  typeChipText: {
    color: COLORS.textTertiary, fontSize: 10, fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardAmount: {
    color: COLORS.textPrimary,
    fontSize: 22, fontWeight: '800',
    fontFamily: 'monospace', letterSpacing: -0.8,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.warningMuted,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: `${COLORS.warning}35`,
  },
  pendingDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: COLORS.warning,
  },
  pendingBadgeText: {
    color: COLORS.warning, fontSize: 11, fontWeight: '600',
  },
  cardChevron: {
    marginHorizontal: 12,
  },

  // ── FAB ──────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    right: 20,
    width: 54, height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.vozpe500,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.vozpe500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
});
