import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { COLORS, GROUP_TYPE_CONFIG } from '@kivo/shared';
import type { GroupType } from '@kivo/shared';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/auth.store';
import { useGroupStore } from '../../../stores/group.store';
import { Button } from '../../../components/common/Button';

const GROUP_TYPES = Object.entries(GROUP_TYPE_CONFIG) as [GroupType, { label: string; emoji: string }][];

const CURRENCIES = [
  { code: 'USD', label: 'USD · Dólar' },
  { code: 'PEN', label: 'PEN · Sol' },
  { code: 'EUR', label: 'EUR · Euro' },
  { code: 'CLP', label: 'CLP · Peso CL' },
];

export default function CreateGroupScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const user          = useAuthStore(s => s.user);
  const sessionUserId = useAuthStore(s => s.sessionUserId);
  const fetchGroups   = useGroupStore(s => s.fetchGroups);

  const [name, setName]         = useState('');
  const [type, setType]         = useState<GroupType>('travel');
  const [currency, setCurrency] = useState('USD');
  const [emoji, setEmoji]       = useState('✈️');
  const [loading, setLoading]   = useState(false);

  const typeConfig = GROUP_TYPE_CONFIG[type];

  // Update emoji when type changes
  const handleTypeSelect = (t: GroupType) => {
    setType(t);
    setEmoji(GROUP_TYPE_CONFIG[t].emoji);
  };

  const handleCreate = async () => {
    const ownerId = user?.id ?? sessionUserId;
    if (!name.trim() || !ownerId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_group_with_owner', {
        p_name:          name.trim(),
        p_type:          type,
        p_cover_emoji:   emoji,
        p_base_currency: currency,
        p_owner_id:      ownerId,
      });
      if (error) throw error;
      await fetchGroups();
      router.replace(`/(app)/group/${(data as any).id}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear grupo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover */}
        <View style={styles.coverSection}>
          <View style={styles.coverCircle}>
            <Text style={styles.coverEmoji}>{emoji}</Text>
          </View>
          <Text style={styles.coverHint}>Toca para cambiar</Text>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nombre del grupo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Viaje a Chile…"
            placeholderTextColor={COLORS.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={60}
          />
        </View>

        {/* Type */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tipo</Text>
          <View style={styles.typeGrid}>
            {GROUP_TYPES.map(([t, cfg]) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeCard, type === t && styles.typeCardActive]}
                onPress={() => handleTypeSelect(t)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
                <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
                  {cfg.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Moneda base</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map(c => (
              <TouchableOpacity
                key={c.code}
                style={[styles.currencyChip, currency === c.code && styles.currencyChipActive]}
                onPress={() => setCurrency(c.code)}
                activeOpacity={0.7}
              >
                <Text style={[styles.currencyText, currency === c.code && styles.currencyTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label="Crear grupo"
          onPress={handleCreate}
          loading={loading}
          disabled={!name.trim()}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24 },

  coverSection: { alignItems: 'center', gap: 8 },
  coverCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.borderDefault,
  },
  coverEmoji: { fontSize: 40 },
  coverHint: { color: COLORS.textTertiary, fontSize: 13 },

  field: { gap: 10 },
  fieldLabel: {
    fontSize: 13, fontWeight: '600', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderDefault,
    paddingHorizontal: 16, paddingVertical: 14,
    color: COLORS.textPrimary, fontSize: 16,
  },

  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  typeCard: {
    width: '22%', aspectRatio: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderDefault,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  typeCardActive: {
    borderColor: COLORS.kivo500,
    backgroundColor: `${COLORS.kivo500}15`,
  },
  typeEmoji: { fontSize: 22 },
  typeLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center' },
  typeLabelActive: { color: COLORS.kivo400 },

  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 999, borderWidth: 1, borderColor: COLORS.borderDefault,
  },
  currencyChipActive: {
    borderColor: COLORS.kivo500,
    backgroundColor: `${COLORS.kivo500}15`,
  },
  currencyText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  currencyTextActive: { color: COLORS.kivo400 },

  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgBase,
  },
});
