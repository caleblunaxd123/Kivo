import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity } from 'lucide-react-native';
import { COLORS, formatRelativeTime, CATEGORY_CONFIG, formatCurrency } from '@vozpe/shared';
import type { Entry } from '@vozpe/shared';
import { useGroupStore } from '../../stores/group.store';
import { supabase } from '../../lib/supabase';
import { EmptyState } from '../../components/common/EmptyState';

interface ActivityItem {
  id: string;
  groupId: string;
  groupName: string;
  groupEmoji: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
  createdAt: string;
  createdBy?: string;
  creatorName?: string;
}

export default function ActivityScreen() {
  const insets   = useSafeAreaInsets();
  const groups   = useGroupStore(s => s.groups);
  const [items,       setItems]       = useState<ActivityItem[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);

  const fetchActivity = useCallback(async () => {
    if (groups.length === 0) return;
    setIsLoading(true);
    try {
      // Fetch recent entries from all my groups, newest first
      const groupIds = groups.map(g => g.id);

      const { data, error } = await supabase
        .from('entries')
        .select('id, group_id, description, amount, currency, category, status, created_at, created_by')
        .in('group_id', groupIds)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return;

      const mapped: ActivityItem[] = data.map((row: any) => {
        const group = groups.find(g => g.id === row.group_id);
        return {
          id:           row.id,
          groupId:      row.group_id,
          groupName:    group?.name ?? 'Grupo',
          groupEmoji:   group?.coverEmoji ?? '📋',
          description:  row.description || 'Sin descripción',
          amount:       row.amount,
          currency:     row.currency,
          category:     row.category ?? 'other',
          status:       row.status,
          createdAt:    row.created_at,
          createdBy:    row.created_by,
        };
      });

      setItems(mapped);
    } finally {
      setIsLoading(false);
    }
  }, [groups]);

  useEffect(() => { fetchActivity(); }, [groups.length]);

  // Group items by date label
  const sections = useMemo(() => {
    if (items.length === 0) return [];
    const today     = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const todayStr     = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    const map: Record<string, { title: string; data: ActivityItem[] }> = {};
    for (const item of items) {
      const d = new Date(item.createdAt);
      const ds = d.toDateString();
      let label: string;
      if (ds === todayStr)      label = 'Hoy';
      else if (ds === yesterdayStr) label = 'Ayer';
      else label = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' });

      if (!map[label]) map[label] = { title: label, data: [] };
      map[label].data.push(item);
    }
    return Object.values(map);
  }, [items]);

  const pendingCount = useMemo(() =>
    items.filter(i => i.status === 'pending_review').length, [items]);

  if (groups.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Actividad</Text>
        </View>
        <EmptyState
          emoji="📡"
          title="Sin grupos aún"
          subtitle="Crea o únete a un grupo para ver la actividad aquí."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with stats */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <Activity size={18} color={COLORS.vozpe400} strokeWidth={2} />
            <Text style={styles.title}>Actividad</Text>
          </View>
          {items.length > 0 && (
            <Text style={styles.subtitle}>{items.length} entradas</Text>
          )}
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingStrip}>
            <Text style={styles.pendingStripText}>
              ⚠ {pendingCount} entrada{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de revisión
            </Text>
          </View>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={i => i.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={sections.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchActivity}
            tintColor={COLORS.vozpe500}
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              emoji="📡"
              title="Sin actividad reciente"
              subtitle="Cuando alguien agregue una entrada en tus grupos, aparecerá aquí."
            />
          ) : null
        }
        renderItem={({ item }) => <ActivityRow item={item} />}
      />
    </View>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const cat       = CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
  const isPending = item.status === 'pending_review';

  return (
    <View style={[styles.row, isPending && styles.rowPending]}>
      {/* Left: group emoji */}
      <View style={styles.rowLeft}>
        <Text style={styles.groupEmoji}>{item.groupEmoji}</Text>
        {isPending && <View style={styles.rowPendingDot} />}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        {/* Top: description + amount */}
        <View style={styles.rowTop}>
          <Text style={styles.rowDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.rowAmount}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
        </View>

        {/* Bottom: group + category + time */}
        <View style={styles.rowBottom}>
          <Text style={styles.rowGroup} numberOfLines={1}>{item.groupName}</Text>
          <Text style={styles.rowDot}>·</Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {cat.emoji} {cat.label}
          </Text>
          <Text style={styles.rowDot}>·</Text>
          <Text style={styles.rowTime}>{formatRelativeTime(item.createdAt)}</Text>
        </View>

        {isPending && (
          <Text style={styles.rowPendingLabel}>⚠ Pendiente de revisión</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgSurface,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary },
  pendingStrip: {
    backgroundColor: `${COLORS.warning}12`,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: `${COLORS.warning}30`,
  },
  pendingStripText: { color: COLORS.warning, fontSize: 12, fontWeight: '500' },

  sectionHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 12, fontWeight: '700', color: COLORS.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },

  list: { paddingBottom: 32 },
  emptyContainer: { flex: 1, paddingHorizontal: 16 },
  separator: { height: 1, backgroundColor: COLORS.borderSubtle, marginLeft: 72 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.bgBase,
  },
  rowPending: { backgroundColor: `${COLORS.warning}06` },
  rowLeft: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  groupEmoji: { fontSize: 22 },
  rowContent: { flex: 1, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowDesc: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  rowAmount: {
    fontSize: 14, fontWeight: '700', color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  rowBottom: { flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap' },
  rowGroup: {
    fontSize: 12, color: COLORS.vozpe400, fontWeight: '600', flexShrink: 1,
  },
  rowDot: { color: COLORS.borderStrong, fontSize: 11, marginHorizontal: 5 },
  rowMeta: { fontSize: 12, color: COLORS.textTertiary, flexShrink: 1 },
  rowTime: { fontSize: 11, color: COLORS.textTertiary, marginLeft: 4 },
  rowPendingDot: {
    position: 'absolute' as const,
    top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.warning,
    borderWidth: 1.5, borderColor: COLORS.bgBase,
  },
  rowPendingLabel: {
    fontSize: 11, color: COLORS.warning, fontWeight: '500', marginTop: 2,
  },
});
