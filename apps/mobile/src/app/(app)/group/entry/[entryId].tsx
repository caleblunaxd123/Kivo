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
import { CATEGORY_CONFIG, formatCurrency, formatDate } from '@kivo/shared';
import type { EntryCategory, EntryStatus } from '@kivo/shared';
import { useGroupStore } from '../../../../stores/group.store';
import { useAuthStore } from '../../../../stores/auth.store';
import { T } from '../../../../theme/tokens';

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [EntryCategory, { emoji: string; label: string }][];

const ORIGIN_LABELS: Record<string, string> = {
  voice:  'Voz',
  photo:  'Foto',
  text:   'Texto rápido',
  manual: 'Manual',
  import: 'Importado',
};

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
          <ChevronLeft size={22} color={T.textSecondary} />
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
          <ChevronLeft size={22} color={T.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editando entrada' : 'Detalle'}
        </Text>
        <View style={styles.headerActions}>
          {!isEditing ? (
            <>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setIsEditing(true)}>
                <Pencil size={18} color={T.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.iconBtnDanger]}
                onPress={handleDelete}
                disabled={isDeleting || isSaving}
              >
                {isDeleting
                  ? <ActivityIndicator size="small" color={T.error} />
                  : <Trash2 size={18} color={T.error} />
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
            <View style={styles.pendingBannerTop}>
              <AlertTriangle size={15} color={T.warning} />
              <Text style={styles.pendingBannerTitle}>Entrada pendiente de revisión</Text>
            </View>
            {(entry.pendingReasons?.length ?? 0) > 0 && (
              <Text style={styles.pendingBannerText}>
                {entry.pendingReasons!.join(' · ')}
              </Text>
            )}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              disabled={isSaving}
            >
              {isSaving
                ? <ActivityIndicator size="small" color={T.success} />
                : <CheckCircle2 size={15} color={T.success} />
              }
              <Text style={styles.confirmBtnText}>
                {isSaving ? 'Confirmando…' : 'Marcar como confirmada'}
              </Text>
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
              placeholderTextColor={T.textMuted}
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
          <MetaField label="Origen" value={ORIGIN_LABELS[entry.origin] ?? entry.origin} />
          <MetaField label="Agregado por" value={creator?.displayName ?? '—'} />
          {!isPending && (
            <MetaField
              label="Estado"
              value="Confirmado ✓"
              valueStyle={{ color: T.success }}
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
              placeholderTextColor={T.textMuted}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={[styles.fieldValue, !entry.notes && { color: T.textMuted }]}>
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
  container:  { flex: 1, backgroundColor: T.appBg },
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:  { color: T.textSecondary, fontSize: 15 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: T.strokeSoft,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, fontSize: 16, fontWeight: '700',
    color: T.textPrimary, letterSpacing: -0.3,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnDanger: { backgroundColor: T.errorBg },
  cancelEditBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: T.rSm, borderWidth: 1, borderColor: T.strokeSoft,
  },
  cancelEditText: { color: T.textSecondary, fontSize: 14 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: T.blue, borderRadius: T.rSm,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  scroll: { flex: 1 },

  pendingBanner: {
    flexDirection: 'column', gap: 10,
    margin: 16, padding: 14,
    backgroundColor: T.warningBg,
    borderRadius: T.rMd, borderWidth: 1, borderColor: `${T.warning}35`,
    borderLeftWidth: 3, borderLeftColor: T.warning,
  },
  pendingBannerTop: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  pendingBannerTitle: {
    color: T.warning, fontSize: 13, fontWeight: '700', flex: 1,
  },
  pendingBannerText: {
    color: T.textSecondary, fontSize: 12, lineHeight: 17,
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: T.greenSoft, borderRadius: T.rSm,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: T.strokeGreen,
  },
  confirmBtnText: { color: T.success, fontSize: 13, fontWeight: '600' },

  amountCard: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 28, gap: 8,
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: T.cardBg,
    borderRadius: T.rCard, borderWidth: 1, borderColor: T.strokeSoft,
    ...T.shadowCard,
  },
  amountEmoji: { fontSize: 36 },
  amountText: {
    fontSize: 36, fontWeight: '800', color: T.textPrimary,
    fontFamily: 'monospace', letterSpacing: -1,
  },
  amountInput: {
    fontSize: 36, fontWeight: '800', color: T.blue,
    fontFamily: 'monospace', letterSpacing: -1,
    borderBottomWidth: 2, borderBottomColor: T.blue,
    minWidth: 120, textAlign: 'center',
  },
  amountCurrency: { color: T.textMuted, fontSize: 13, fontWeight: '500' },

  section: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: T.cardBg,
    borderRadius: T.rMd, borderWidth: 1, borderColor: T.strokeSoft,
    padding: 14, gap: 8,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: T.textMuted,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  fieldValue: { color: T.textPrimary, fontSize: 15 },
  textInput: {
    color: T.textPrimary, fontSize: 15,
    backgroundColor: T.inputBg, borderRadius: T.rSm,
    padding: 10, borderWidth: 1, borderColor: T.strokeBlue,
  },
  textInputMulti: { minHeight: 80, textAlignVertical: 'top' },

  categoryRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: T.rBtn, borderWidth: 1, borderColor: T.strokeSoft,
    backgroundColor: T.blueSoft,
  },
  catChipActive: { borderColor: T.blue, backgroundColor: T.blueLight },
  catEmoji: { fontSize: 13 },
  catLabel: { fontSize: 12, color: T.textSecondary, fontWeight: '500' },
  catLabelActive: { color: T.blue },

  metaGrid: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: T.cardBg,
    borderRadius: T.rMd, borderWidth: 1, borderColor: T.strokeSoft,
    overflow: 'hidden',
  },
  metaField: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderTopWidth: 1, borderTopColor: T.strokeSoft,
  },
  metaLabel: { color: T.textMuted, fontSize: 13 },
  metaValue: { color: T.textSecondary, fontSize: 13, fontWeight: '500' },

  rawInputBox: {
    backgroundColor: T.inputBg, borderRadius: T.rSm, padding: 10,
  },
  rawInputText: {
    color: T.textMuted, fontSize: 12, fontStyle: 'italic',
  },
});
