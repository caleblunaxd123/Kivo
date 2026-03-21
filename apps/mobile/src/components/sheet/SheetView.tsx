/**
 * SheetView — Hoja de gastos estilo spreadsheet (Excel-inspired)
 * Fondo blanco/verde, grid real con bordes, columnas fijas.
 * Calcula totales en tiempo real por categoría y estado.
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, Platform,
} from 'react-native';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { COLORS, CATEGORY_CONFIG, formatCurrency, formatDate } from '@kivo/shared';
import type { Entry, GroupMember } from '@kivo/shared';
import { EmptyState } from '../common/EmptyState';

// ─── Paleta Excel ────────────────────────────────────────────────────────────
const XL = {
  headerBg:     '#1D6F42',   // Verde Excel oscuro
  headerText:   '#FFFFFF',
  rowEven:      '#FFFFFF',
  rowOdd:       '#F0F7F3',   // Verde muy suave
  rowPending:   '#FFF8ED',   // Naranja muy suave
  rowPendingBorder: '#F59E0B',
  border:       '#C8D8C8',   // Borde verde suave
  borderDark:   '#9ABD9A',
  totalBg:      '#E8F5EE',
  totalText:    '#1D6F42',
  chipConfirmed: '#D1FAE5',
  chipConfirmedText: '#065F46',
  chipPending:  '#FEF3C7',
  chipPendingText: '#92400E',
  accentBar:    '#F59E0B',
  text:         '#1A2E1A',
  textSub:      '#4A6741',
  textMuted:    '#7A9A7A',
};

interface SheetViewProps {
  entries: Entry[];
  members: GroupMember[];
  groupId: string;
  baseCurrency?: string;
  onEntryPress?: (entryId: string) => void;
  initialFilter?: 'all' | 'confirmed' | 'pending';
}

type FilterKey = 'all' | 'confirmed' | 'pending';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'pending',   label: 'Pendientes' },
];

export function SheetView({
  entries, members, groupId, baseCurrency = 'USD', onEntryPress, initialFilter = 'all',
}: SheetViewProps) {
  const [filter, setFilter] = useState<FilterKey>(initialFilter);

  const filtered = useMemo(() => entries.filter(e => {
    if (filter === 'confirmed') return e.status === 'confirmed';
    if (filter === 'pending')   return e.status === 'pending_review';
    return e.status !== 'archived';
  }), [entries, filter]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()),
  [filtered]);

  const stats = useMemo(() => {
    const confirmed = filtered.filter(e => e.status === 'confirmed');
    const pending   = filtered.filter(e => e.status === 'pending_review');
    const total     = confirmed.reduce((s, e) => s + (e.amountInBase ?? e.amount), 0);
    return { confirmed: confirmed.length, pending: pending.length, total };
  }, [filtered]);

  const counts = useMemo(() => ({
    all:       entries.filter(e => e.status !== 'archived').length,
    confirmed: entries.filter(e => e.status === 'confirmed').length,
    pending:   entries.filter(e => e.status === 'pending_review').length,
  }), [entries]);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          emoji="📋"
          title="La hoja está vacía"
          subtitle="Cada entrada que agregues aparecerá aquí. Usa voz, foto o texto rápido."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Filtros ── */}
      <View style={styles.filterBar}>
        {FILTERS.map(f => {
          const isActive = filter === f.key;
          const count = counts[f.key];
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>confirmadas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, stats.pending > 0 && styles.statValueWarning]}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>pendientes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={[styles.statItem, { flex: 2 }]}>
          <Text style={[styles.statValue, styles.statValueTotal]}>
            {formatCurrency(stats.total, baseCurrency)}
          </Text>
          <Text style={styles.statLabel}>total confirmado</Text>
        </View>
      </View>

      {/* ── Spreadsheet ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
        <View style={{ minWidth: '100%' }}>

          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={[styles.hCell, styles.colN]}>#</Text>
            <Text style={[styles.hCell, styles.colFecha]}>Fecha</Text>
            <Text style={[styles.hCell, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.hCell, styles.colCat]}>Categoría</Text>
            <Text style={[styles.hCell, styles.colMonto, { textAlign: 'right' }]}>Monto</Text>
            <Text style={[styles.hCell, styles.colPago]}>Pagó</Text>
            <Text style={[styles.hCell, styles.colReparto]}>Reparto</Text>
            <Text style={[styles.hCell, styles.colEstado, { textAlign: 'center' }]}>Estado</Text>
          </View>

          {/* Data rows */}
          <FlatList
            data={sorted}
            keyExtractor={e => e.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <SheetRow
                entry={item}
                index={index + 1}
                members={members}
                isEven={index % 2 === 0}
                onPress={onEntryPress ? () => onEntryPress(item.id) : undefined}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyFilter}>
                <Text style={styles.emptyFilterText}>
                  Sin entradas {filter === 'confirmed' ? 'confirmadas' : 'pendientes'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>
      </ScrollView>

      {/* ── Footer totals ── */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>{sorted.length} fila{sorted.length !== 1 ? 's' : ''}</Text>
        <View style={styles.footerRight}>
          <Text style={styles.footerTotalLabel}>TOTAL CONFIRMADO</Text>
          <Text style={styles.footerTotal}>{formatCurrency(stats.total, baseCurrency)}</Text>
        </View>
      </View>
    </View>
  );
}

function SheetRow({
  entry, index, members, isEven, onPress,
}: {
  entry: Entry;
  index: number;
  members: GroupMember[];
  isEven: boolean;
  onPress?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPending   = entry.status === 'pending_review';
  const isConfirmed = entry.status === 'confirmed';
  const cat         = CATEGORY_CONFIG[entry.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.other;
  const paidBy      = members.find(
    m => (m.userId && m.userId === entry.paidBy) || m.id === entry.paidBy
  );

  const rowBg = isPending ? XL.rowPending : isEven ? XL.rowEven : XL.rowOdd;

  return (
    <View>
      <TouchableOpacity
        style={[styles.dataRow, { backgroundColor: rowBg }]}
        onPress={onPress ?? (() => setExpanded(v => !v))}
        activeOpacity={0.7}
      >
        {/* Pending left border */}
        {isPending && <View style={styles.pendingAccent} />}

        {/* # */}
        <Text style={[styles.dCell, styles.colN, styles.cellN]}>{index}</Text>

        {/* Fecha */}
        <Text style={[styles.dCell, styles.colFecha, styles.cellMono]}>
          {formatDate(entry.entryDate)}
        </Text>

        {/* Descripción */}
        <View style={[styles.colDesc, styles.dCell]}>
          <Text style={styles.cellDesc} numberOfLines={1}>{entry.description || '—'}</Text>
        </View>

        {/* Categoría */}
        <View style={[styles.dCell, styles.colCat]}>
          <View style={[styles.catChip, { backgroundColor: `${cat.color}20` }]}>
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catLabel, { color: cat.color }]} numberOfLines={1}>
              {cat.label}
            </Text>
          </View>
        </View>

        {/* Monto */}
        <Text style={[styles.dCell, styles.colMonto, styles.cellAmount]}>
          {formatCurrency(entry.amount, entry.currency)}
        </Text>

        {/* Pagó */}
        <Text style={[styles.dCell, styles.colPago, styles.cellSub]} numberOfLines={1}>
          {paidBy?.displayName ?? '—'}
        </Text>

        {/* Reparto */}
        <Text style={[styles.dCell, styles.colReparto, styles.cellSub]} numberOfLines={1}>
          {entry.splitRule === 'equal' ? '÷ Igual' : entry.splitRule ?? '—'}
        </Text>

        {/* Estado */}
        <View style={[styles.dCell, styles.colEstado, { alignItems: 'center' }]}>
          <View style={isPending ? styles.chipPending : styles.chipConfirmed}>
            {isPending
              ? <AlertCircle  size={11} color={XL.chipPendingText} />
              : <CheckCircle2 size={11} color={XL.chipConfirmedText} />
            }
            <Text style={isPending ? styles.chipPendingText : styles.chipConfirmedText}>
              {isPending ? 'Pendiente' : 'OK'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded detail */}
      {!onPress && expanded && (
        <View style={[styles.expandPanel, { backgroundColor: isEven ? '#F8FFF8' : '#F0FAF0' }]}>
          {entry.rawInput ? (
            <Text style={styles.rawText}>📝 "{entry.rawInput}"</Text>
          ) : null}
          {entry.pendingReasons?.length > 0 && (
            <Text style={styles.pendingReason}>
              ⚠ Falta: {entry.pendingReasons.join(', ')}
            </Text>
          )}
          {entry.notes ? (
            <Text style={styles.notesText}>💬 {entry.notes}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

// ─── Column widths ────────────────────────────────────────────────────────────
const COL = {
  n:       32,
  fecha:   74,
  desc:    160,
  cat:     110,
  monto:   90,
  pago:    80,
  reparto: 70,
  estado:  88,
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F8FAF8' },
  emptyWrap:   { flex: 1, backgroundColor: '#F8FAF8' },
  hScroll:     { flex: 1 },

  // ── Filtros ──────────────────────────────────────────────────
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: XL.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: XL.border,
    backgroundColor: '#fff',
  },
  filterTabActive: {
    backgroundColor: XL.headerBg,
    borderColor: XL.headerBg,
  },
  filterTabText: {
    fontSize: 12, fontWeight: '600', color: XL.textSub,
  },
  filterTabTextActive: { color: '#fff' },
  filterBadge: {
    backgroundColor: XL.totalBg,
    borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1,
    minWidth: 18, alignItems: 'center',
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: XL.textSub },
  filterBadgeTextActive: { color: '#fff' },

  // ── Stats row ────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    backgroundColor: XL.totalBg,
    borderBottomWidth: 1,
    borderBottomColor: XL.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: {
    fontSize: 16, fontWeight: '800',
    color: XL.text, fontFamily: 'monospace',
  },
  statValueWarning: { color: '#D97706' },
  statValueTotal: { color: XL.headerBg, fontSize: 18 },
  statLabel: { fontSize: 10, color: XL.textMuted, fontWeight: '500', marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: XL.border },

  // ── Header row ───────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    backgroundColor: XL.headerBg,
    borderBottomWidth: 2,
    borderBottomColor: '#155734',
  },
  hCell: {
    paddingHorizontal: 8,
    paddingVertical: 9,
    fontSize: 11,
    fontWeight: '700',
    color: XL.headerText,
    letterSpacing: 0.3,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },

  // ── Data row ─────────────────────────────────────────────────
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: XL.border,
    minHeight: 44,
    position: 'relative',
  },
  dCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: XL.border,
    justifyContent: 'center',
  },
  pendingAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, backgroundColor: XL.accentBar,
  },

  // Cell styles
  cellN:     { color: XL.textMuted, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  cellMono:  { color: XL.textSub,   fontSize: 11, fontFamily: 'monospace' },
  cellDesc:  { color: XL.text,      fontSize: 13, fontWeight: '600' },
  cellAmount:{ color: XL.text,      fontSize: 13, fontWeight: '700', fontFamily: 'monospace', textAlign: 'right' },
  cellSub:   { color: XL.textSub,   fontSize: 12 },

  // Category chip
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  catEmoji: { fontSize: 12 },
  catLabel: { fontSize: 10, fontWeight: '600' },

  // Status chips
  chipConfirmed: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: XL.chipConfirmed,
    borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3,
  },
  chipConfirmedText: { fontSize: 10, fontWeight: '700', color: XL.chipConfirmedText },
  chipPending: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: XL.chipPending,
    borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3,
  },
  chipPendingText: { fontSize: 10, fontWeight: '700', color: XL.chipPendingText },

  // Expanded panel
  expandPanel: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: XL.border,
    gap: 4,
  },
  rawText:      { color: XL.textSub,  fontSize: 12, fontStyle: 'italic' },
  pendingReason:{ color: '#D97706',   fontSize: 12, fontWeight: '500' },
  notesText:    { color: XL.textSub,  fontSize: 12 },

  // Empty
  emptyFilter: { paddingVertical: 40, alignItems: 'center', backgroundColor: '#fff' },
  emptyFilterText: { color: XL.textMuted, fontSize: 13 },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: XL.totalBg,
    borderTopWidth: 2, borderTopColor: XL.headerBg,
  },
  footerLabel: { color: XL.textSub, fontSize: 12, fontWeight: '500' },
  footerRight: { alignItems: 'flex-end', gap: 2 },
  footerTotalLabel: {
    fontSize: 9, fontWeight: '700', color: XL.headerBg, letterSpacing: 0.8,
  },
  footerTotal: {
    fontSize: 20, fontWeight: '800',
    color: XL.headerBg, fontFamily: 'monospace', letterSpacing: -0.5,
  },

  // Column width definitions
  colN:      { width: COL.n },
  colFecha:  { width: COL.fecha },
  colDesc:   { width: COL.desc },
  colCat:    { width: COL.cat },
  colMonto:  { width: COL.monto },
  colPago:   { width: COL.pago },
  colReparto:{ width: COL.reparto },
  colEstado: { width: COL.estado },
});
