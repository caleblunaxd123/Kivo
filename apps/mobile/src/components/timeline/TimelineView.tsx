import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Mic, Camera, PenLine, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react-native';
import {
  COLORS, CATEGORY_CONFIG, formatCurrency, formatRelativeTime,
} from '@vozpe/shared';
import type { Entry, GroupMember } from '@vozpe/shared';
import { Avatar } from '../common/Avatar';
import { EmptyState } from '../common/EmptyState';

interface TimelineViewProps {
  entries: Entry[];
  members: GroupMember[];
  onEntryPress?: (entryId: string) => void;
}

export function TimelineView({ entries, members, onEntryPress }: TimelineViewProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        emoji="⚡"
        title="Nada por aquí todavía"
        subtitle="Usa el compositor para agregar la primera entrada al grupo."
      />
    );
  }

  // Sort by date desc
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={e => e.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <TimelineCard
          entry={item}
          members={members}
          onPress={onEntryPress ? () => onEntryPress(item.id) : undefined}
        />
      )}
    />
  );
}

function TimelineCard({
  entry, members, onPress,
}: { entry: Entry; members: GroupMember[]; onPress?: () => void }) {
  const creator = members.find(
    m => (m.userId && m.userId === entry.createdBy) || m.id === entry.createdBy
  );
  const cat = CATEGORY_CONFIG[entry.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
  const isPending = entry.status === 'pending_review';

  const OriginIcon = {
    voice:  Mic,
    photo:  Camera,
    text:   PenLine,
    manual: PenLine,
    import: PenLine,
  }[entry.origin] ?? PenLine;

  return (
    <TouchableOpacity
      style={[styles.card, isPending && styles.cardPending]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      {/* Left timeline dot */}
      <View style={styles.dotCol}>
        <View style={[styles.dot, isPending && styles.dotPending]} />
        <View style={styles.line} />
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          {creator ? (
            <Avatar name={creator.displayName} size="xs" colorHex={creator.colorHex} />
          ) : (
            <View style={styles.systemDot}><Sparkles size={10} color={COLORS.ai} /></View>
          )}
          <Text style={styles.creatorName} numberOfLines={1}>
            {creator?.displayName ?? 'Vozpe ✦'}
          </Text>
          <OriginIcon size={12} color={COLORS.textTertiary} />
          <Text style={styles.timestamp}>{formatRelativeTime(entry.createdAt)}</Text>
        </View>

        {/* Main card */}
        <View style={[styles.entryCard, isPending && styles.entryCardPending]}>
          <View style={styles.entryTop}>
            <Text style={styles.entryEmoji}>{cat.emoji}</Text>
            <Text style={styles.entryDesc} numberOfLines={2}>{entry.description || '—'}</Text>
            <Text style={styles.entryAmount}>
              {formatCurrency(entry.amount, entry.currency)}
            </Text>
          </View>

          <View style={styles.entryBottom}>
            <View style={styles.entryMeta}>
              {entry.splitRule === 'equal' && (
                <Text style={styles.metaChip}>÷ igual</Text>
              )}
              <Text style={styles.metaCat}>{cat.emoji} {cat.label}</Text>
            </View>
            <View style={styles.statusChip}>
              {isPending ? (
                <AlertCircle size={12} color={COLORS.warning} />
              ) : (
                <CheckCircle2 size={12} color={COLORS.success} />
              )}
              <Text style={[styles.statusText, isPending && styles.statusTextPending]}>
                {isPending ? 'Pendiente' : 'Confirmado'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  separator: { height: 4 },

  card: {
    flexDirection: 'row',
    gap: 12,
  },
  cardPending: {},

  dotCol: { alignItems: 'center', paddingTop: 16 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.vozpe500,
    borderWidth: 2, borderColor: COLORS.bgBase,
  },
  dotPending: { backgroundColor: COLORS.warning },
  line: {
    flex: 1, width: 1,
    backgroundColor: COLORS.borderSubtle,
    marginTop: 4,
  },
  systemDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.aiMuted,
    alignItems: 'center', justifyContent: 'center',
  },

  cardContent: { flex: 1, gap: 6, paddingBottom: 12 },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2,
  },
  creatorName: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500', flex: 1 },
  timestamp: { color: COLORS.textTertiary, fontSize: 11 },

  entryCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: 12, gap: 8,
  },
  entryCardPending: { borderLeftWidth: 3, borderLeftColor: COLORS.warning },

  entryTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  entryEmoji: { fontSize: 18, marginTop: 1 },
  entryDesc: {
    flex: 1, color: COLORS.textPrimary,
    fontSize: 15, fontWeight: '600', letterSpacing: -0.2,
  },
  entryAmount: {
    color: COLORS.textPrimary, fontSize: 16, fontWeight: '700',
    fontFamily: 'monospace', letterSpacing: -0.3,
  },

  entryBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  entryMeta: { flexDirection: 'row', gap: 6 },
  metaChip: {
    color: COLORS.vozpe400, fontSize: 11, fontWeight: '500',
    backgroundColor: `${COLORS.vozpe500}15`, borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  metaCat: { color: COLORS.textTertiary, fontSize: 11 },

  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  statusText: { color: COLORS.success, fontSize: 11, fontWeight: '500' },
  statusTextPending: { color: COLORS.warning },
});
