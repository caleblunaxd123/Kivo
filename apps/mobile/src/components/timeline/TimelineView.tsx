import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Mic, Camera, PenLine, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { CATEGORY_CONFIG, formatCurrency, formatRelativeTime } from '@kivo/shared';
import type { Entry, GroupMember } from '@kivo/shared';
import { Avatar } from '../common/Avatar';
import { EmptyState } from '../common/EmptyState';
import { T } from '../../theme/tokens';

// Purple AI accent (no direct T equivalent)
const AI_COLOR = '#7C3AED';
const AI_MUTED = 'rgba(124,58,237,0.08)';

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
        title="Aún no hay entradas"
        subtitle="Usa voz, foto o texto en el compositor de abajo para registrar el primer gasto."
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
            <View style={styles.systemDot}>
              <Sparkles size={10} color={AI_COLOR} />
            </View>
          )}
          <Text style={styles.creatorName} numberOfLines={1}>
            {creator?.displayName ?? 'Kivo ✦'}
          </Text>
          <OriginIcon size={12} color={T.textMuted} />
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
                <AlertCircle size={12} color={T.warning} />
              ) : (
                <CheckCircle2 size={12} color={T.success} />
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
  list: { padding: 16, paddingBottom: 120 },
  separator: { height: 8 },

  card: {
    flexDirection: 'row',
    gap: 12,
  },
  cardPending: {},

  dotCol: { alignItems: 'center', paddingTop: 16 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: T.blue,
    borderWidth: 2, borderColor: T.appBg,
  },
  dotPending: { backgroundColor: T.warning },
  line: {
    flex: 1, width: 1,
    backgroundColor: T.strokeSoft,
    marginTop: 4,
  },
  systemDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: AI_MUTED,
    alignItems: 'center', justifyContent: 'center',
  },

  cardContent: { flex: 1, gap: 6, paddingBottom: 12 },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2,
  },
  creatorName: { color: T.textSecondary, fontSize: 12, fontWeight: '500', flex: 1 },
  timestamp: { color: T.textMuted, fontSize: 11 },

  entryCard: {
    backgroundColor: T.cardBg,
    borderRadius: T.rCard, borderWidth: 1, borderColor: T.strokeSoft,
    padding: 12, gap: 8,
    ...T.shadowXs,
  },
  entryCardPending: { borderLeftWidth: 3, borderLeftColor: T.warning },

  entryTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  entryEmoji: { fontSize: 18, marginTop: 1 },
  entryDesc: {
    flex: 1, color: T.textPrimary,
    fontSize: 15, fontWeight: '600', letterSpacing: -0.2,
  },
  entryAmount: {
    color: T.textPrimary, fontSize: 16, fontWeight: '700',
    fontFamily: 'monospace', letterSpacing: -0.3,
  },

  entryBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  entryMeta: { flexDirection: 'row', gap: 6 },
  metaChip: {
    color: T.blue, fontSize: 11, fontWeight: '500',
    backgroundColor: T.blue + '15', borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  metaCat: { color: T.textMuted, fontSize: 11 },

  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  statusText: { color: T.success, fontSize: 11, fontWeight: '500' },
  statusTextPending: { color: T.warning },
});
