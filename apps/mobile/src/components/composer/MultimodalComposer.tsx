/**
 * MultimodalComposer — El compositor multimodal de Vozpe
 * El componente más importante de la app.
 * Permite captura por voz, foto y texto.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Mic, Camera, PenLine, Square, X, Sparkles, Check, ArrowRight } from 'lucide-react-native';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import type { ParsedEntry, GroupMember } from '@vozpe/shared';
import { parseQuickText } from '@vozpe/shared';
import { T } from '../../theme/tokens';

type ComposerMode = 'idle' | 'voice_recording' | 'voice_preview' | 'photo_preview' | 'text_input';

interface MultimodalComposerProps {
  groupId: string;
  members: GroupMember[];
  defaultCurrency: string;
  onEntryConfirmed: (parsed: Partial<ParsedEntry>, rawInput: string) => void;
  onPhotoSelected: (uri: string) => void;
}

export function MultimodalComposer({
  groupId,
  members,
  defaultCurrency,
  onEntryConfirmed,
  onPhotoSelected,
}: MultimodalComposerProps) {
  const [mode, setMode] = useState<ComposerMode>('idle');
  const [text, setText] = useState('');
  const [transcription, setTranscription] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [parsedPreview, setParsedPreview] = useState<Partial<ParsedEntry> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // ─── Voice Recording ───────────────────────────────────────────────────────

  const MAX_RECORDING_SECONDS = 30;

  const startVoiceRecording = useCallback(async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return;

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setMode('voice_recording');
    setRecordingDuration(0);

    let elapsed = 0;
    durationInterval.current = setInterval(() => {
      elapsed += 1;
      setRecordingDuration(elapsed);
      if (elapsed >= MAX_RECORDING_SECONDS) {
        // Auto-stop: se llama fuera del interval para evitar problemas
        setTimeout(() => stopVoiceRecording(), 0);
      }
    }, 1000);

    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 650, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }, [recorder, pulseAnim]);

  const stopVoiceRecording = useCallback(async () => {
    if (!recorder.isRecording) return;
    clearInterval(durationInterval.current!);
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);

    setIsProcessing(true);
    setError(null);
    setMode('voice_preview');

    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (uri) {
        // Read audio as base64 and send to Whisper via Edge Function
        const rawBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64' as any,
        });
        // Strip newlines — atob() in Deno throws on line-broken base64
        const audioBase64 = rawBase64.replace(/[\r\n\s]/g, '');
        await FileSystem.deleteAsync(uri, { idempotent: true });

        const { supabase } = await import('../../lib/supabase');
        const { data, error: fnError } = await supabase.functions.invoke('parse-entry', {
          body: { mode: 'transcribe', audioBase64, audioFormat: 'm4a' },
        });

        if (fnError) {
          // Log real error for debugging, fall back to text input so the user
          // doesn't lose their recording intent
          console.error('[stopVoiceRecording] transcription error detail:', fnError);
          setMode('text_input');
          setError('Transcripción no disponible. Escribe el gasto manualmente.');
          return;
        }

        const result = (data?.transcription as string | null);
        const textToUse = result ?? '';
        setTranscription(textToUse);

        if (!textToUse) {
          setMode('text_input');
          setError('No se detectó voz. Escribe el gasto manualmente.');
          return;
        }

        const { parsed } = parseQuickText(
          textToUse,
          members.map(m => ({ id: m.id, name: m.displayName })),
          defaultCurrency
        );
        setParsedPreview(parsed);
      }
    } catch (err: any) {
      console.error('[stopVoiceRecording] error:', err);
      setError(err?.message ?? 'Error al procesar el audio. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  }, [recorder, defaultCurrency, members, pulseAnim]);

  // ─── Photo ─────────────────────────────────────────────────────────────────

  const openCamera = useCallback(async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      onPhotoSelected(result.assets[0].uri);
    }
  }, [onPhotoSelected]);

  // ─── Text Quick Parse ──────────────────────────────────────────────────────

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    if (value.length >= 4) {
      const { parsed } = parseQuickText(
        value,
        members.map(m => ({ id: m.id, name: m.displayName })),
        defaultCurrency
      );
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  }, [defaultCurrency, members]);

  const confirmEntry = useCallback(() => {
    if (!parsedPreview) return;
    const rawInput = mode === 'text_input' ? text : transcription;
    onEntryConfirmed(parsedPreview, rawInput);
    setText('');
    setTranscription('');
    setParsedPreview(null);
    setMode('idle');
  }, [mode, onEntryConfirmed, parsedPreview, text, transcription]);

  const cancel = useCallback(() => {
    if (recorder.isRecording) recorder.stop().catch(() => {});
    clearInterval(durationInterval.current!);
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
    setText('');
    setTranscription('');
    setParsedPreview(null);
    setError(null);
    setMode('idle');
  }, [recorder, pulseAnim]);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Idle bar ──────────────────────────────────────────────────────────────

  if (mode === 'idle') {
    return (
      <View style={styles.idleContainer}>
        <View style={styles.actionsRow}>
          {/* Camera — secondary */}
          <View style={styles.actionCol}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={openCamera}
              accessibilityRole="button"
              accessibilityLabel="Tomar foto de ticket"
            >
              <Camera size={22} color={COLORS.vozpe500} strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={styles.actionColLabel}>Foto</Text>
          </View>

          {/* Mic — HERO */}
          <View style={styles.actionCol}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={startVoiceRecording}
              accessibilityRole="button"
              accessibilityLabel="Grabar con voz"
            >
              <Mic size={30} color={COLORS.white} strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={styles.heroBtnLabel}>Grabar</Text>
          </View>

          {/* Text — tertiary */}
          <View style={styles.actionCol}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setMode('text_input')}
              accessibilityRole="button"
              accessibilityLabel="Escribir manualmente"
            >
              <PenLine size={22} color={COLORS.vozpe500} strokeWidth={1.8} />
            </TouchableOpacity>
            <Text style={styles.actionColLabel}>Texto</Text>
          </View>
        </View>
      </View>
    );
  }

  // ─── Voice recording ───────────────────────────────────────────────────────

  if (mode === 'voice_recording') {
    return (
      <View style={styles.expandedContainer}>
        {/* Header */}
        <View style={styles.expandedHeader}>
          <View style={styles.recIndicator}>
            <View style={styles.recDot} />
            <Text style={styles.recLabel}>GRABANDO</Text>
          </View>
          <Text style={[
            styles.duration,
            recordingDuration >= MAX_RECORDING_SECONDS - 5 && styles.durationWarning,
          ]}>
            {formatDuration(recordingDuration)} / {formatDuration(MAX_RECORDING_SECONDS)}
          </Text>
          <TouchableOpacity onPress={cancel} style={styles.closeBtn}>
            <X size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Waveform */}
        <View style={styles.waveform}>
          {Array.from({ length: 28 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: Math.sin(i * 0.8) * 18 + 22,
                  opacity: 0.3 + (i % 3) * 0.2,
                },
              ]}
            />
          ))}
        </View>

        {/* Stop button */}
        <Animated.View style={[styles.stopWrap, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity style={styles.stopBtn} onPress={stopVoiceRecording} accessibilityRole="button" accessibilityLabel="Detener grabación">
            <Square size={18} color={COLORS.white} fill={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.stopHint}>Toca para detener</Text>
      </View>
    );
  }

  // ─── Voice preview ─────────────────────────────────────────────────────────

  if (mode === 'voice_preview') {
    return (
      <View style={styles.expandedContainer}>
        <View style={styles.expandedHeader}>
          <View style={styles.aiLabel}>
            <Sparkles size={14} color={COLORS.ai} />
            <Text style={styles.aiLabelText}>Vozpe interpreta</Text>
          </View>
          <TouchableOpacity onPress={cancel} style={styles.closeBtn}>
            <X size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {isProcessing ? (
          <View style={styles.processingRow}>
            <View style={styles.processingDot} />
            <Text style={styles.processingText}>Procesando audio…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(null); cancel(); }}>
              <Text style={styles.retryBtnText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.parsedCard}>
            {parsedPreview?.description ? (
              <Text style={styles.parsedDesc}>{parsedPreview.description}</Text>
            ) : null}
            <Text style={styles.parsedMeta}>
              {parsedPreview?.amount != null ? `$${parsedPreview.amount}` : '—'}
              {parsedPreview?.currency ? ` ${parsedPreview.currency}` : ''}
              {parsedPreview?.splitRule === 'equal' ? ' · División igual' : ''}
            </Text>
            {parsedPreview?.pendingReasons?.length ? (
              <Text style={styles.pendingHint}>
                ⚠ Faltan: {parsedPreview.pendingReasons.join(', ')}
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancel}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmEntry}>
            <Check size={16} color={COLORS.white} />
            <Text style={styles.confirmBtnText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Text input ────────────────────────────────────────────────────────────

  if (mode === 'text_input') {
    return (
      <View style={styles.expandedContainer}>
        <View style={styles.expandedHeader}>
          <Text style={styles.textTitle}>Escribe rápido</Text>
          <TouchableOpacity onPress={cancel} style={styles.closeBtn}>
            <X size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.textInputWrap}>
          <TextInput
            style={styles.textInput}
            placeholder="uber 22 dividido entre 3…"
            placeholderTextColor={COLORS.textTertiary}
            value={text}
            onChangeText={handleTextChange}
            autoFocus
            returnKeyType="send"
            onSubmitEditing={parsedPreview ? confirmEntry : undefined}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !parsedPreview && styles.sendBtnDisabled]}
            onPress={confirmEntry}
            disabled={!parsedPreview}
          >
            <ArrowRight size={18} color={parsedPreview ? COLORS.white : COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        {parsedPreview && (
          <View style={styles.livePreview}>
            <Sparkles size={12} color={COLORS.ai} />
            <Text style={styles.livePreviewText}>
              {parsedPreview.description ?? ''}
              {parsedPreview.amount != null ? ` · $${parsedPreview.amount}` : ''}
              {parsedPreview.splitRule === 'equal' ? ' · ÷ igual' : ''}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return null;
}

const BOTTOM_EXTRA = Platform.OS === 'ios' ? 28 : 12;

const styles = StyleSheet.create({
  // ── Idle bar ─────────────────────────────────────────────────
  idleContainer: {
    backgroundColor: T.cardBg,
    borderTopWidth: 1,
    borderTopColor: T.strokeSoft,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: BOTTOM_EXTRA + 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  actionCol: { alignItems: 'center', gap: 6 },
  secondaryBtn: {
    width: 58, height: 58,
    borderRadius: T.rCard,
    backgroundColor: T.blue + '10',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: T.blue + '25',
  },
  actionColLabel: {
    color: T.textMuted, fontSize: 11, fontWeight: '500',
  },
  heroBtn: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: T.blue,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42, shadowRadius: 18, elevation: 12,
  },
  heroBtnLabel: {
    color: T.blue, fontSize: 11, fontWeight: '700',
  },

  // ── Expanded container ────────────────────────────────────────
  expandedContainer: {
    backgroundColor: T.cardBg,
    borderTopWidth: 1,
    borderTopColor: T.strokeSoft,
    padding: 16,
    paddingBottom: BOTTOM_EXTRA,
    gap: 12,
  },
  expandedHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: T.blueSoft,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.strokeSoft,
  },

  // ── Recording ────────────────────────────────────────────────
  recIndicator: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.error },
  recLabel: { color: T.error, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  duration: { color: T.textSecondary, fontSize: 14, fontFamily: 'monospace', marginRight: 8 },
  durationWarning: { color: T.error, fontWeight: '700' },
  waveform: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 3, height: 56,
  },
  waveBar: { width: 3.5, borderRadius: 2, backgroundColor: T.blue },
  stopWrap: { alignSelf: 'center' },
  stopBtn: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: T.blue,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: T.blueLight,
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 12, elevation: 8,
  },
  stopHint: { color: T.textMuted, fontSize: 11, textAlign: 'center' },

  // ── AI / processing ───────────────────────────────────────────
  aiLabel:    { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  aiLabelText:{ color: T.blue, fontSize: 13, fontWeight: '600' },

  processingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  processingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.blue },
  processingText:{ color: T.textSecondary, fontSize: 14 },

  // ── Parsed card ───────────────────────────────────────────────
  parsedCard: {
    backgroundColor: T.blueSoft,
    borderWidth: 1, borderColor: T.strokeBlue,
    borderRadius: T.rCard, padding: 14, gap: 4,
  },
  parsedDesc: { color: T.textPrimary, fontSize: 16, fontWeight: '600' },
  parsedMeta: { color: T.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  pendingHint:{ color: T.warning, fontSize: 12, marginTop: 4 },

  // ── Error state ─────────────────────────────────────────────
  errorCard: {
    backgroundColor: T.errorBg,
    borderWidth: 1, borderColor: T.error + '30',
    borderRadius: T.rCard, padding: 14, gap: 10,
    alignItems: 'center',
  },
  errorText: { color: T.error, fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: T.cardBg,
    borderRadius: T.rMd, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: T.strokeSoft,
  },
  retryBtnText: { color: T.textSecondary, fontSize: 13, fontWeight: '500' },

  // ── Action row ────────────────────────────────────────────────
  actionRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.blueSoft,
    borderRadius: T.rCard, paddingVertical: 13,
    borderWidth: 1, borderColor: T.strokeSoft,
  },
  cancelBtnText: { color: T.textSecondary, fontSize: 14, fontWeight: '500' },
  confirmBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7,
    backgroundColor: T.blue,
    borderRadius: T.rCard, paddingVertical: 13,
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // ── Text input ────────────────────────────────────────────────
  textTitle: { color: T.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  textInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.inputBg,
    borderRadius: T.rCard,
    borderWidth: 1, borderColor: T.strokeSoft,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  textInput: { flex: 1, color: T.textPrimary, fontSize: 15, fontFamily: 'monospace' },
  sendBtn: {
    width: 34, height: 34, borderRadius: T.rMd,
    backgroundColor: T.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: T.blueSoft,
    borderWidth: 1, borderColor: T.strokeSoft,
  },
  livePreview: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.blueSoft,
    borderRadius: T.rMd, padding: 10,
    borderWidth: 1, borderColor: T.strokeBlue,
  },
  livePreviewText: { color: T.blueDeep, fontSize: 12, fontFamily: 'monospace', flex: 1 },
});
