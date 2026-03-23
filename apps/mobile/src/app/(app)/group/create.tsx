import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Mic, Square, Loader } from 'lucide-react-native';
import { GROUP_TYPE_CONFIG } from '@vozpe/shared';
import type { GroupType } from '@vozpe/shared';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/auth.store';
import { useGroupStore } from '../../../stores/group.store';
import { useVoiceRecording } from '../../../hooks/useVoiceRecording';
import { Button } from '../../../components/common/Button';
import { T } from '../../../theme/tokens';

const GROUP_TYPES = Object.entries(GROUP_TYPE_CONFIG) as [GroupType, { label: string; emoji: string }][];

const CURRENCIES = [
  { code: 'USD', label: 'USD · Dólar' },
  { code: 'PEN', label: 'PEN · Sol' },
  { code: 'EUR', label: 'EUR · Euro' },
  { code: 'CLP', label: 'CLP · Peso CL' },
];

// ─── Voice parser — extracts group fields from a transcription ────────────────
function parseGroupFromVoice(text: string): {
  name: string;
  type: GroupType;
  currency: string;
} {
  const lower = text.toLowerCase();

  // Detect type
  let type: GroupType = 'travel';
  if (/\b(casa|hogar|roomie|cuarto|depa|apartamento|piso|alquiler)\b/.test(lower)) type = 'home';
  else if (/\b(evento|fiesta|cumplea|boda|celebraci|graduaci|reunión|reunion)\b/.test(lower)) type = 'event';
  else if (/\b(pareja|novio|novia|esposo|esposa|amor|romantico|cita)\b/.test(lower)) type = 'couple';
  else if (/\b(trabajo|oficina|empresa|laboral|equipo|proyecto)\b/.test(lower)) type = 'work';
  else if (/\b(viaje|trip|vac|tour|paseo|excursion)\b/.test(lower)) type = 'travel';

  // Detect currency
  let currency = 'USD';
  if (/\b(sol|soles|pen)\b/.test(lower)) currency = 'PEN';
  else if (/\b(euro|euros|eur)\b/.test(lower)) currency = 'EUR';
  else if (/\b(peso|pesos|clp|cop|mxn|ars)\b/.test(lower)) {
    if (/\b(chile|clp)\b/.test(lower)) currency = 'CLP';
    else currency = 'USD'; // ambiguous, default
  }
  else if (/\b(d[oó]lar|d[oó]lares|usd)\b/.test(lower)) currency = 'USD';

  // Extract name: remove currency/type keywords and clean up
  const stopWords = [
    'crear', 'grupo', 'para', 'de', 'del', 'el', 'la', 'los', 'las', 'un', 'una',
    'viaje', 'casa', 'evento', 'pareja', 'trabajo', 'hogar', 'fiesta',
    'sol', 'soles', 'dólar', 'dólares', 'euro', 'euros', 'peso', 'pesos',
    'en', 'con', 'por', 'y', 'a', 'que',
  ];
  const words = text.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase()));
  const name = words.join(' ').replace(/[.,!?]+$/, '').trim();

  return { name: name || text.trim(), type, currency };
}

export default function CreateGroupScreen() {
  const router        = useRouter();
  const insets        = useSafeAreaInsets();
  const user          = useAuthStore(s => s.user);
  const sessionUserId = useAuthStore(s => s.sessionUserId);
  const fetchGroups   = useGroupStore(s => s.fetchGroups);

  const [name, setName]         = useState('');
  const [type, setType]         = useState<GroupType>('travel');
  const [currency, setCurrency] = useState('USD');
  const [emoji, setEmoji]       = useState('✈️');
  const [loading, setLoading]   = useState(false);

  const { state: voiceState, startRecording, stopAndTranscribe, cancelRecording } = useVoiceRecording();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef  = useRef<Animated.CompositeAnimation | null>(null);

  const handleTypeSelect = (t: GroupType) => {
    setType(t);
    setEmoji(GROUP_TYPE_CONFIG[t].emoji);
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const startVoice = async () => {
    try {
      await startRecording();
    } catch (e: any) {
      Alert.alert('Micrófono', e?.message ?? 'No se pudo acceder al micrófono.');
      return;
    }
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
  };

  const stopVoice = async () => {
    pulseRef.current?.stop();
    pulseAnim.setValue(1);
    try {
      const transcription = await stopAndTranscribe();
      if (transcription) {
        const parsed = parseGroupFromVoice(transcription);
        if (parsed.name) setName(parsed.name);
        handleTypeSelect(parsed.type);
        setCurrency(parsed.currency);
      } else {
        Alert.alert('Sin voz detectada', 'No se pudo transcribir. Intenta hablar más claro.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Error al procesar la grabación.');
    }
  };

  const cancelVoice = async () => {
    pulseRef.current?.stop();
    pulseAnim.setValue(1);
    await cancelRecording();
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (loading) return; // Prevent double-tap
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

      const groupId = (data as any)?.id as string | undefined;
      if (!groupId) throw new Error('No se obtuvo el ID del grupo creado');

      await fetchGroups();
      router.replace(`/(app)/group/${groupId}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setLoading(false);
    }
  };

  const isRecording   = voiceState === 'recording';
  const isTranscribing = voiceState === 'processing';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color={T.textSecondary} />
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
          <Text style={styles.coverHint}>Se actualiza según el tipo</Text>
        </View>

        {/* Voice banner */}
        <View style={styles.voiceBanner}>
          {isTranscribing ? (
            <View style={styles.voiceRow}>
              <Loader size={16} color={T.blue} />
              <Text style={styles.voiceHint}>Transcribiendo…</Text>
            </View>
          ) : isRecording ? (
            <View style={styles.voiceRow}>
              <Animated.View style={[styles.voiceDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.voiceHint}>Di el nombre y tipo del grupo…</Text>
              <TouchableOpacity style={styles.voiceStopBtn} onPress={stopVoice}>
                <Square size={14} color="#FFF" fill="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelVoice}>
                <Text style={styles.voiceCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.voiceRow} onPress={startVoice} activeOpacity={0.7}>
              <View style={styles.voiceMicBtn}>
                <Mic size={15} color={T.blue} />
              </View>
              <Text style={styles.voiceHint}>
                <Text style={styles.voiceHintBold}>Crea con voz</Text>
                {' '}— di "Viaje a Lima en soles"
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nombre del grupo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Viaje a Chile…"
            placeholderTextColor={T.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus={false}
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
                <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]} numberOfLines={1}>
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
          disabled={!name.trim() || isRecording || isTranscribing || loading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.appBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: T.strokeSoft,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: T.textPrimary },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24 },

  coverSection: { alignItems: 'center', gap: 8 },
  coverCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: T.blueSoft,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: T.strokeBlue,
  },
  coverEmoji: { fontSize: 40 },
  coverHint: { color: T.textMuted, fontSize: 13 },

  // Voice banner
  voiceBanner: {
    backgroundColor: T.blue + '0D',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.blue + '30',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voiceDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: T.error,
  },
  voiceMicBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: T.blue + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  voiceStopBtn: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: T.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  voiceHint: { flex: 1, color: T.textSecondary, fontSize: 12.5 },
  voiceHintBold: { color: T.blue, fontWeight: '700' },
  voiceCancelText: { color: T.textMuted, fontSize: 12 },

  field: { gap: 10 },
  fieldLabel: {
    fontSize: 13, fontWeight: '600', color: T.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: T.cardBg,
    borderRadius: 14, borderWidth: 1, borderColor: T.strokeSoft,
    paddingHorizontal: 16, paddingVertical: 14,
    color: T.textPrimary, fontSize: 16,
  },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: {
    flexBasis: '22%', flexGrow: 1, maxWidth: '30%',
    aspectRatio: 1,
    backgroundColor: T.blueSoft,
    borderRadius: 14, borderWidth: 1, borderColor: T.strokeSoft,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  typeCardActive: {
    borderColor: T.blue,
    backgroundColor: T.blue + '15',
  },
  typeEmoji: { fontSize: 22 },
  typeLabel: {
    fontSize: 10, color: T.textSecondary, fontWeight: '500',
    textAlign: 'center', paddingHorizontal: 2,
  },
  typeLabelActive: { color: T.blue, fontWeight: '700' },

  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: T.blueSoft,
    borderRadius: 999, borderWidth: 1, borderColor: T.strokeSoft,
  },
  currencyChipActive: {
    borderColor: T.blue,
    backgroundColor: T.blue + '15',
  },
  currencyText: { color: T.textSecondary, fontSize: 13, fontWeight: '500' },
  currencyTextActive: { color: T.blue, fontWeight: '700' },

  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: T.strokeSoft,
    backgroundColor: T.appBg,
  },
});
