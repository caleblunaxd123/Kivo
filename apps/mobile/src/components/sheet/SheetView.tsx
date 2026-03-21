import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import {
  COLORS, CATEGORY_CONFIG, formatCurrency, formatDate,
} from '@kivo/shared';
import type { Entry, GroupMember } from '@kivo/shared';
import { EmptyState } from '../common/EmptyState';

interface SheetViewProps {
  entries: Entry[];
  members: GroupMember[];
  groupId: string;
  onEntryPress?: (entryId: string) => void;
  initialFilter?: 'all' | 'confirmed' | 'pending';
}

type FilterKey = 'all' | 'confirmed' | 'pending';

export function SheetView({
  entries, members, groupId, onEntryPress, initialFilter = 'all',
}: SheetViewProps) {
  const [filter, setFilter] = useState<FilterKey>(initialFilter);

  const filtered = entries.filter(e => {
    if (filter === 'confirmed') return e.status === 'confirmed';
    if (filter === 'pending')   return e.status === 'pending_review';
    return e.status !== 'archived';
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  );

  const confirmedTotal = filtered
    .filter(e => e.status === 'confirmed')
    .reduce((sum, e) => sum + (e.amountInBase ?? e.amount), 0);

  if (entries.length === 0) {
    return (
      <EmptyState
        emoji="📋"
        title="La hoja está vacía"
        subtitle="Cada entrada que agregues aparecerá aquí como una fila editable."
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(['all', 'confirmed', 'pending'] as FilterKey[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Todas' : f === 'confirmed' ? 'Confirmadas' : 'Pendientes'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Column headers */}
      <View style={styles.colHeaders}>
        <Text style={[styles.colHeader, styles.colNumStyle]}>#</Text>
        <Text style={[styles.colHeader, styles.colDescStyle]}>Descripción</Text>
        <Text style={[styles.colHeader, styles.colAmountStyle]}>Monto</Text>
        <Text style={[styles.colHeader, styles.colStatusStyle]}>Est.</Text>
      </View>

      {/* Rows */}
      <FlatList
        data={sorted}
        keyExtractor={e => e.id}
        ItemSeparatorComponent={() => <View style={styles.rowSep} />}
        renderItem={({ item, index }) => (
          <SheetRow
            entry={item}
            index={index + 1}
            members={members}
            onPress={onEntryPress ? () => onEntryPress(item.id) : undefined}
          />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Footer totals */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>{sorted.length} entradas</Text>
        <Text style={styles.footerTotal}>
          {formatCurrency(confirmedTotal, 'USD')}
        </Text>
      </View>
    </View>
  );
}

function SheetRow({
  entry, index, members, onPress,
}: {
  entry: Entry;
  index: number;
  members: GroupMember[];
  onPress?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPending    = entry.status === 'pending_review';
  const cat          = CATEGORY_CONFIG[entry.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
  const paidByMember = members.find(m => m.userId === entry.paidBy);

  return (
    <View>
      <TouchableOpacity
        style={[styles.row, isPending && styles.rowPending]}
        onPress={onPress ?? (() => setExpanded(e => !e))}
        activeOpacity={0.7}
        onLongPress={onPress ? undefined : () => setExpanded(e => !e)}
      >
        {isPending && <View style={styles.pendingBar} />}

        <Text style={styles.colNumText}>{index}</Text>

        <View style={styles.colDescStyle}>
          <View style={styles.descRow}>
            <Text style={styles.descEmoji}>{cat.emoji}</Text>
            <Text style={styles.descText} numberOfLines={1}>
              {entry.description || '—'}
            </Text>
          </View>
        </View>

        <Text style={styles.colAmountText}>
          {formatCurrency(entry.amount, entry.currency)}
        </Text>

        <View style={styles.colStatusStyle}>
          {isPending
            ? <AlertCircle size={15} color={COLORS.warning} />
            : <CheckCircle2 size={15} color={COLORS.success} />
          }
        </View>
      </TouchableOpacity>

      {/* Expanded preview when no navigation handler */}
      {!onPress && expanded && (
        <View style={styles.expanded}>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Pagó</Text>
            <Text style={styles.expandedValue}>{paidByMember?.displayName ?? '—'}</Text>
          </View>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Reparto</Text>
            <Text style={styles.expandedValue}>
              {entry.splitRule === 'equal' ? 'División igual' : entry.splitRule ?? '—'}
            </Text>
          </View>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Fecha</Text>
            <Text style={styles.expandedValue}>{formatDate(entry.entryDate)}</Text>
          </View>
          {entry.rawInput && (
            <View style={styles.expandedRaw}>
              <Text style={styles.expandedRawText}>"{entry.rawInput}"</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const COL_NUM    = 32;
const COL_STATUS = 36;
const COL_AMOUNT = 90;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },

  toolbar: {
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  filters: { paddingHorizontal: 12, gap: 6 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1, borderColor: COLORS.borderDefault,
    backgroundColor: COLORS.bgElevated,
  },
  filterChipActive: { borderColor: COLORS.kivo500, backgroundColor: `${COLORS.kivo500}15` },
  filterText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: COLORS.kivo400 },

  colHeaders: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderDefault,
    backgroundColor: COLORS.bgSurface,
  },
  colHeader: {
    fontSize: 10, fontWeight: '700', color: COLORS.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  colNumStyle:    { width: COL_NUM, textAlign: 'center' },
  colDescStyle:   { flex: 1 },
  colAmountStyle: { width: COL_AMOUNT, textAlign: 'right' },
  colStatusStyle: { width: COL_STATUS, alignItems: 'center' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: COLORS.bgBase,
    minHeight: 48,
  },
  rowPending: { backgroundColor: `${COLORS.warning}06` },
  rowSep: { height: 1, backgroundColor: COLORS.borderSubtle },
  pendingBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, backgroundColor: COLORS.warning,
  },

  colNumText: {
    width: COL_NUM, textAlign: 'center',
    color: COLORS.textTertiary, fontSize: 12,
  },
  colAmountText: {
    width: COL_AMOUNT, textAlign: 'right',
    color: COLORS.textPrimary, fontSize: 14,
    fontFamily: 'monospace', fontWeight: '600',
  },
  descRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  descEmoji: { fontSize: 14 },
  descText: { color: COLORS.textPrimary, fontSize: 14, flex: 1 },

  // Expanded (fallback when no navigation)
  expanded: {
    backgroundColor: COLORS.bgElevated,
    borderTopWidth: 1, borderTopColor: COLORS.borderSubtle,
    padding: 12, gap: 6,
  },
  expandedRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  expandedLabel: { color: COLORS.textTertiary, fontSize: 12 },
  expandedValue: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  expandedRaw: {
    marginTop: 4, padding: 8,
    backgroundColor: COLORS.bgInput, borderRadius: 8,
  },
  expandedRawText: {
    color: COLORS.textTertiary, fontSize: 11, fontStyle: 'italic',
  },

  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.borderDefault,
    backgroundColor: COLORS.bgSurface,
  },
  footerLabel: { color: COLORS.textTertiary, fontSize: 12 },
  footerTotal: {
    color: COLORS.textPrimary, fontSize: 18, fontWeight: '700',
    fontFamily: 'monospace', letterSpacing: -0.5,
  },
});
