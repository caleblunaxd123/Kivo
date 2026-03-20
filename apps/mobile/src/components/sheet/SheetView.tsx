import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ScrollView,
} from 'react-native';
import { AlertCircle, CheckCircle2, Filter } from 'lucide-react-native';
import {
  COLORS, CATEGORY_CONFIG, formatCurrency, formatDate,
} from '@kivo/shared';
import type { Entry, GroupMember } from '@kivo/shared';
import { EmptyState } from '../common/EmptyState';
import { supabase } from '../../lib/supabase';

interface SheetViewProps {
  entries: Entry[];
  members: GroupMember[];
  groupId: string;
}

type SortKey = 'date' | 'amount' | 'description';
type FilterKey = 'all' | 'confirmed' | 'pending';

export function SheetView({ entries, members, groupId }: SheetViewProps) {
  const [filter, setFilter]         = useState<FilterKey>('all');
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editValue, setEditValue]   = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const handleSaveDescription = useCallback(async (id: string) => {
    if (!editValue.trim()) { setEditingId(null); return; }
    await supabase.from('entries').update({ description: editValue.trim() }).eq('id', id);
    setEditingId(null);
  }, [editValue]);

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
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Column headers */}
      <View style={styles.colHeaders}>
        <Text style={[styles.colHeader, styles.colNum]}>#</Text>
        <Text style={[styles.colHeader, styles.colDesc]}>Descripción</Text>
        <Text style={[styles.colHeader, styles.colAmount]}>Monto</Text>
        <Text style={[styles.colHeader, styles.colStatus]}>Est.</Text>
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
            isExpanded={expandedId === item.id}
            isEditing={editingId === item.id}
            editValue={editValue}
            onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onStartEdit={() => { setEditingId(item.id); setEditValue(item.description); }}
            onEditChange={setEditValue}
            onSaveEdit={() => handleSaveDescription(item.id)}
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
  entry, index, members,
  isExpanded, isEditing, editValue,
  onToggleExpand, onStartEdit, onEditChange, onSaveEdit,
}: {
  entry: Entry;
  index: number;
  members: GroupMember[];
  isExpanded: boolean;
  isEditing: boolean;
  editValue: string;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onSaveEdit: () => void;
}) {
  const isPending = entry.status === 'pending_review';
  const cat = CATEGORY_CONFIG[entry.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
  const paidByMember = members.find(m => m.userId === entry.paidBy);

  return (
    <View>
      <TouchableOpacity
        style={[styles.row, isPending && styles.rowPending]}
        onPress={onToggleExpand}
        activeOpacity={0.7}
        onLongPress={onStartEdit}
      >
        {/* Pending indicator */}
        {isPending && <View style={styles.pendingBar} />}

        <Text style={styles.colNum}>{index}</Text>

        <View style={styles.colDesc}>
          {isEditing ? (
            <TextInput
              style={styles.inlineInput}
              value={editValue}
              onChangeText={onEditChange}
              onBlur={onSaveEdit}
              onSubmitEditing={onSaveEdit}
              autoFocus
              returnKeyType="done"
            />
          ) : (
            <View style={styles.descRow}>
              <Text style={styles.descEmoji}>{cat.emoji}</Text>
              <Text style={styles.descText} numberOfLines={1}>
                {entry.description || '—'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.colAmountText}>
          {formatCurrency(entry.amount, entry.currency)}
        </Text>

        <View style={styles.colStatus}>
          {isPending
            ? <AlertCircle size={15} color={COLORS.warning} />
            : <CheckCircle2 size={15} color={COLORS.success} />
          }
        </View>
      </TouchableOpacity>

      {/* Expanded detail */}
      {isExpanded && (
        <View style={styles.expanded}>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Pagó</Text>
            <Text style={styles.expandedValue}>
              {paidByMember?.displayName ?? '—'}
            </Text>
          </View>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Reparto</Text>
            <Text style={styles.expandedValue}>
              {entry.splitRule === 'equal' ? 'División igual' : entry.splitRule ?? '—'}
            </Text>
          </View>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Categoría</Text>
            <Text style={styles.expandedValue}>{cat.emoji} {cat.label}</Text>
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
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingRight: 12,
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
  filterBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.borderDefault,
    alignItems: 'center', justifyContent: 'center',
  },

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
  colNum:    { width: COL_NUM, textAlign: 'center' },
  colDesc:   { flex: 1 },
  colAmount: { width: COL_AMOUNT, textAlign: 'right' },
  colStatus: { width: COL_STATUS, alignItems: 'center' },

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

  colAmountText: {
    width: COL_AMOUNT, textAlign: 'right',
    color: COLORS.textPrimary, fontSize: 14,
    fontFamily: 'monospace', fontWeight: '600',
  },
  descRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  descEmoji: { fontSize: 14 },
  descText: { color: COLORS.textPrimary, fontSize: 14, flex: 1 },

  inlineInput: {
    color: COLORS.textPrimary, fontSize: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.kivo500,
    paddingVertical: 2, flex: 1,
  },

  // Expanded
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
