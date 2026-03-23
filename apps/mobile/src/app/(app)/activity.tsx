import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, ChevronRight } from 'lucide-react-native';
import { formatRelativeTime, CATEGORY_CONFIG, formatCurrency } from '@kivo/shared';
import type { Entry } from '@kivo/shared';
import { useGroupStore } from '../../stores/group.store';
import { supabase } from '../../lib/supabase';
import { EmptyState } from '../../components/common/EmptyState';
import { T } from '../../theme/tokens';

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
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const groups = useGroupStore(s => s.groups);
  const [items,     setItems]     = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivity = useCallback(async () => {
    if (groups.length === 0) return;
    setIsLoading(true);
    try {
      const groupIds = groups.map(g => g.id);
      const { data, error } = await supabase
        .from('entries')
        .select('id, group_id, description, amount, currency, category, status, created_at')
        .in('group_id', groupIds)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(60);

      if (error || !data) return;
      setItems(data.map((row: any) => {
        const group = groups.find(g => g.id === row.group_id);
        return {
          id:          row.id,
          groupId:     row.group_id,
          groupName:   group?.name ?? 'Grupo',
          groupEmoji:  group?.coverEmoji ?? '📋',
          description: row.description || 'Sin descripción',
          amount:      row.amount,
          currency:    row.currency,
          category:    row.category ?? 'other',
          status:      row.status,
          createdAt:   row.created_at,
        };
      }));
    } finally {
      setIsLoading(false);
    }
  }, [groups]);

  useEffect(() => { fetchActivity(); }, [groups.length]);

  const sections = useMemo(() => {
    if (items.length === 0) return [];
    const today     = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const todayStr     = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    const map: Record<string, { title: string; data: ActivityItem[] }> = {};
    for (const item of items) {
      const d  = new Date(item.createdAt);
      const ds = d.toDateString();
      const label = ds === todayStr ? 'Hoy'
        : ds === yesterdayStr ? 'Ayer'
        : d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' });
      if (!map[label]) map[label] = { title: label, data: [] };
      map[label].data.push(item);
    }
    return Object.values(map);
  }, [items]);

  const pendingCount = useMemo(
    () => items.filter(i => i.status === 'pending_review').length,
    [items]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBlob} pointerEvents="none" />
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconBox}>
              <Activity size={16} color={T.blue} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Actividad</Text>
          </View>
          {items.length > 0 && (
            <Text style={styles.countLabel}>{items.length} entradas</Text>
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
        contentContainerStyle={sections.length === 0 ? styles.emptyWrap : styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchActivity} tintColor={T.blue} />
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
              title={groups.length === 0 ? 'Sin grupos aún' : 'Sin actividad reciente'}
              subtitle={groups.length === 0
                ? 'Crea o únete a un grupo para ver la actividad aquí.'
                : 'Cuando alguien agregue una entrada en tus grupos, aparecerá aquí.'}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <ActivityRow item={item} onPress={() => router.push(`/(app)/group/${item.groupId}`)} />
        )}
      />
    </View>
  );
}

function ActivityRow({ item, onPress }: { item: ActivityItem; onPress: () => void }) {
  const cat       = CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
  const isPending = item.status === 'pending_review';

  return (
    <TouchableOpacity
      style={[styles.row, isPending && styles.rowPending]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      {/* Emoji del grupo */}
      <View style={styles.rowLeft}>
        <Text style={styles.groupEmoji}>{item.groupEmoji}</Text>
        {isPending && <View style={styles.pendingDot} />}
      </View>

      {/* Contenido */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.rowAmount}>{formatCurrency(item.amount, item.currency)}</Text>
        </View>
        <View style={styles.rowMeta}>
          <Text style={styles.rowGroup} numberOfLines={1}>{item.groupName}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.rowCat} numberOfLines={1}>{cat.emoji} {cat.label}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.rowTime} numberOfLines={1}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        {isPending && (
          <Text style={styles.pendingLabel}>⚠ Pendiente de revisión</Text>
        )}
      </View>

      <ChevronRight size={14} color={T.textMuted} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.appBg },

  // Header
  header: {
    backgroundColor: T.headerBg,
    paddingHorizontal: T.spMd,
    paddingTop: T.spMd, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: T.strokeSoft,
    gap: 10, overflow: 'hidden',
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  headerBlob: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: T.blue + '0C',
    top: -80, right: -60,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleIconBox: {
    width: 32, height: 32, borderRadius: T.rIcon,
    backgroundColor: T.blue + '14',
    alignItems: 'center', justifyContent: 'center',
  },
  title:      { fontSize: T.fsLg, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.4 },
  countLabel: { fontSize: T.fsSm, color: T.textMuted, fontWeight: '500' },

  pendingStrip: {
    backgroundColor: T.warningBg,
    borderRadius: T.rMd, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: T.warning + '30',
  },
  pendingStripText: { color: T.warning, fontSize: T.fsSm, fontWeight: '600' },

  sectionHeader: { paddingHorizontal: T.spMd, paddingTop: 16, paddingBottom: 6 },
  sectionHeaderText: {
    fontSize: T.fsXs, fontWeight: '700', color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },

  list:      { paddingBottom: 32 },
  emptyWrap: { flex: 1, paddingHorizontal: T.spMd },
  separator: { height: 1, backgroundColor: T.strokeSoft, marginLeft: 72 },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: T.spMd, paddingVertical: 13,
    backgroundColor: T.cardBg,
  },
  rowPending: { backgroundColor: T.warningBg },
  rowLeft: {
    width: 46, height: 46, borderRadius: T.rMd,
    backgroundColor: T.blueSoft,
    borderWidth: 1, borderColor: T.strokeSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  groupEmoji: { fontSize: 22 },
  pendingDot: {
    position: 'absolute' as const, top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: T.warning,
    borderWidth: 1.5, borderColor: T.cardBg,
  },

  rowContent: { flex: 1, gap: 4 },
  rowTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowDesc:    { flex: 1, fontSize: T.fsMd, fontWeight: '600', color: T.textPrimary, marginRight: 8 },
  rowAmount:  { fontSize: T.fsMd, fontWeight: '700', color: T.textPrimary, fontFamily: 'monospace' },

  rowMeta:  { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  rowGroup: { fontSize: T.fsSm, color: T.blue, fontWeight: '600', flexShrink: 1, maxWidth: '40%' },
  dot:      { color: T.strokeBlue, fontSize: T.fsXs, marginHorizontal: 4 },
  rowCat:   { fontSize: T.fsSm, color: T.textMuted, flexShrink: 1 },
  rowTime:  { fontSize: T.fsXs, color: T.textMuted, marginLeft: 2 },

  pendingLabel: { fontSize: T.fsXs, color: T.warning, fontWeight: '500', marginTop: 2 },
});
