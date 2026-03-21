/**
 * Entry Detail / Edit screen
 * Accessible from timeline or sheet by tapping an entry.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft, Trash2, Check, AlertTriangle, Pencil, CheckCircle2,
} from 'lucide-react-native';
import { COLORS, CATEGORY_CONFIG, formatCurrency, formatDate } from '@vozpe/shared';
import type { EntryCategory, EntryStatus } from '@vozpe/shared';
import { useGroupStore } from '../../../../stores/group.store';
import { useAuthStore } from '../../../../stores/auth.store';

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [EntryCategory, { emoji: string; label: string }][];

export default function EntryDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const user     = useAuthStore(s => s.user);

  const { entries, members, updateEntry, deleteEntry } = useGroupStore();
  const entry = useMemo(() => entries.find(e => e.id === entryId), [entries, entryId]);

  const [isEditing,   setIsEditing]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);

  // Editable fields
  const [description, setDescription] = useState(entry?.description ?? '');
  const [amount,      setAmount]      = useState(String(entry?.amount ?? ''));
  const [category,    setCategory]    = useState<EntryCategory>((entry?.category as EntryCategory) ?? 'other');
  const [notes,       setNotes]       = useState(entry?.notes ?? '');

  const paidByMember = members.find(m => m.userId === entry?.paidBy);
  const creator      = members.find(m => m.userId === entry?.createdBy);
  const cat          = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
  const isPending    = entry?.status === 'pending_review';

  const handleSave = useCallback(async () => {
    if (!entry) return;
    setIsSaving(true);
    try {
      await updateEntry(entry.id, {
        description: description.trim(),
        amount:      parseFloat(amount) || entry.amount,
        category,
        notes:       notes.trim() || undefined,
      });
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setIsSaving(false);
    }
  }, [entry, description, amount, category, notes, updateEntry]);

  const handleConfirm = useCallback(async () => {
    if (!entry) return;
    setIsSaving(true);
    try {
      await updateEntry(entry.id, {
        status: 'confirmed' as EntryStatus,
        pendingReasons: [],
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo confirmar');
    } finally {
      setIsSaving(false);
    }
  }, [entry, updateEntry]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar entrada',
      '¿Eliminar esta entrada? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            if (!entry) return;
            setIsDeleting(true);
            try {
              await deleteEntry(entry.id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo eliminar');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [entry, deleteEntry, router]);

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Entrada no encontrada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editando entrada' : 'Detalle'}
        </Text>
        <View style={styles.headerActions}>
          {!isEditing ? (
            <>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setIsEditing(true)}>
                <Pencil size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.iconBtnDanger]}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting
                  ? <ActivityIndicator size="small" color={COLORS.error} />
                  : <Trash2 size={18} color={COLORS.error} />
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.cancelEditBtn} onPress={() => {
                setDescription(entry.description);
                setAmount(String(entry.amount));
                setCategory((entry.category as EntryCategory) ?? 'other');
                setNotes(entry.notes ?? '');
                setIsEditing(false);
              }}>
                <Text style={styles.cancelEditText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <><Check size={16} color="#fff" /><Text style={styles.saveBtnText}>Guardar</Text></>
                }
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status banner */}
        {isPending && (
          <View style={styles.pendingBanner}>
            <AlertTriangle size={16} color={COLORS.warning} />
            <Text style={styles.pendingBannerText}>
              Pendiente: {entry.pendingReasons?.join(', ') || 'sin detalles'}
            </Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={isSaving}>
              <CheckCircle2 size={15} color={COLORS.success} />
              <Text style={styles.confirmBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Amount card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountEmoji}>{cat.emoji}</Text>
          {isEditing ? (
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          ) : (
            <Text style={styles.amountText}>{formatCurrency(entry.amount, entry.currency)}</Text>
          )}
          <Text style={styles.amountCurrency}>{entry.currency}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Descripción</Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción de la entrada"
              placeholderTextColor={COLORS.textTertiary}
              multiline
            />
          ) : (
            <Text style={styles.fieldValue}>{entry.description || '—'}</Text>
          )}
        </View>

        {/* Category picker (edit mode) */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {CATEGORIES.map(([key, cfg]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.catChip, category === key && styles.catChipActive]}
                    onPress={() => setCategory(key)}
                  >
                    <Text style={styles.catEmoji}>{cfg.emoji}</Text>
                    <Text style={[styles.catLabel, category === key && styles.catLabelActive]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Meta fields */}
        <View style={styles.metaGrid}>
          <MetaField label="Categoría" value={`${cat.emoji} ${cat.label}`} />
          <MetaField label="Pagó" value={paidByMember?.displayName ?? '—'} />
          <MetaField
            label="Reparto"
            value={entry.splitRule === 'equal' ? 'División igual' : entry.splitRule ?? '—'}
          />
          <MetaField label="Fecha" value={formatDate(entry.entryDate)} />
          <MetaField label="Origen" value={entry.origin} />
          <MetaField label="Agregado por" value={creator?.displayName ?? '—'} />
          {!isPending && (
            <MetaField
              label="Estado"
              value="Confirmado ✓"
              valueStyle={{ color: COLORS.success }}
            />
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notas</Text>
          {isEditing ? (
            <TextInput
              style={[styles.textInput, styles.textInputMulti]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas opcionales…"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={[styles.fieldValue, !entry.notes && { color: COLORS.textTertiary }]}>
              {entry.notes || 'Sin notas'}
            </Text>
          )}
        </View>

        {/* Raw input */}
        {entry.rawInput ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Entrada original</Text>
            <View style={styles.rawInputBox}>
              <Text style={styles.rawInputText}>"{entry.rawInput}"</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function MetaField({
  label, value, valueStyle,
}: { label: string; value: string; valueStyle?: object }) {
  return (
    <View style={styles.metaField}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bgBase },
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:  { color: COLORS.textSecondary, fontSize: 15 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, fontSize: 16, fontWeight: '700',
    color: COLORS.textPrimary, letterSpacing: -0.3,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnDanger: { backgroundColor: `${COLORS.error}15` },
  cancelEditBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  cancelEditText: { color: COLORS.textSecondary, fontSize: 14 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: COLORS.vozpe500, borderRadius: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  scroll: { flex: 1 },

  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, padding: 12,
    backgroundColor: `${COLORS.warning}12`,
    borderRadius: 12, borderWidth: 1, borderColor: `${COLORS.warning}30`,
  },
  pendingBannerText: { flex: 1, color: COLORS.warning, fontSize: 13 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${COLORS.success}15`, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: `${COLORS.success}30`,
  },
  confirmBtnText: { color: COLORS.success, fontSize: 12, fontWeight: '600' },

  amountCard: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 28, gap: 8,
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  amountEmoji: { fontSize: 36 },
  amountText: {
    fontSize: 36, fontWeight: '800', color: COLORS.textPrimary,
    fontFamily: 'monospace', letterSpacing: -1,
  },
  amountInput: {
    fontSize: 36, fontWeight: '800', color: COLORS.vozpe400,
    fontFamily: 'monospace', letterSpacing: -1,
    borderBottomWidth: 2, borderBottomColor: COLORS.vozpe500,
    minWidth: 120, textAlign: 'center',
  },
  amountCurrency: { color: COLORS.textTertiary, fontSize: 13, fontWeight: '500' },

  section: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderSubtle,
    padding: 14, gap: 8,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textTertiary,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  fieldValue: { color: COLORS.textPrimary, fontSize: 15 },
  textInput: {
    color: COLORS.textPrimary, fontSize: 15,
    backgroundColor: COLORS.bgInput, borderRadius: 8,
    padding: 10, borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  textInputMulti: { minHeight: 80, textAlignVertical: 'top' },

  categoryRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1, borderColor: COLORS.borderDefault,
    backgroundColor: COLORS.bgElevated,
  },
  catChipActive: { borderColor: COLORS.vozpe500, backgroundColor: `${COLORS.vozpe500}15` },
  catEmoji: { fontSize: 13 },
  catLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  catLabelActive: { color: COLORS.vozpe400 },

  metaGrid: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
  },
  metaField: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderTopWidth: 1, borderTopColor: COLORS.borderSubtle,
  },
  metaLabel: { color: COLORS.textTertiary, fontSize: 13 },
  metaValue: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },

  rawInputBox: {
    backgroundColor: COLORS.bgInput, borderRadius: 8, padding: 10,
  },
  rawInputText: {
    color: COLORS.textTertiary, fontSize: 12, fontStyle: 'italic',
  },
});
