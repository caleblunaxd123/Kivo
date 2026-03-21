import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, formatRelativeTime, CATEGORY_CONFIG } from '@vozpe/shared';
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
      <View style={styles.header}>
        <Text style={styles.title}>Actividad</Text>
        {items.length > 0 && (
          <Text style={styles.subtitle}>{items.length} entradas recientes</Text>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchActivity}
            tintColor={COLORS.vozpe500}
          />
        }
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
      <View style={styles.rowLeft}>
        <Text style={styles.groupEmoji}>{item.groupEmoji}</Text>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.rowAmount}>
            {item.amount.toFixed(2)} {item.currency}
          </Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.rowGroup}>{item.groupName}</Text>
          <Text style={styles.rowMeta}>
            {cat.emoji} {cat.label}
            {isPending ? ' · ⚠ Pendiente' : ''}
          </Text>
          <Text style={styles.rowTime}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
      </View>
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
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  list: { paddingVertical: 8 },
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
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowGroup: {
    fontSize: 12, color: COLORS.vozpe400, fontWeight: '500',
  },
  rowMeta: { fontSize: 12, color: COLORS.textTertiary, flex: 1 },
  rowTime: { fontSize: 11, color: COLORS.textTertiary },
});
