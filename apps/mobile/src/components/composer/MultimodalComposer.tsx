/**
 * MultimodalComposer — El compositor multimodal de Kivo
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
import { Mic, Camera, PenLine, Plus, Square, X, Sparkles, Check } from 'lucide-react-native';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@kivo/shared';
import type { ParsedEntry, GroupMember } from '@kivo/shared';
import { parseQuickText } from '@kivo/shared';

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

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ─── Voice Recording ───────────────────────────────────────────────────────

  const startVoiceRecording = useCallback(async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return;

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await recorder.prepareToRecordAsync();
    recorder.record();
    setMode('voice_recording');
    setRecordingDuration(0);

    durationInterval.current = setInterval(() => {
      setRecordingDuration(d => d + 1);
    }, 1000);

    // Pulse animation on mic button
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [recorder, scaleAnim]);

  const stopVoiceRecording = useCallback(async () => {
    if (!recorder.isRecording) return;
    clearInterval(durationInterval.current!);
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);

    setIsProcessing(true);
    setMode('voice_preview');

    try {
      await recorder.stop();

      // For now, use a placeholder transcription
      // In production: upload to Supabase, call Whisper via Edge Function
      const mockTranscription = transcription || 'Procesando grabación…';
      setTranscription(mockTranscription);

      // Quick parse the transcription
      const { parsed } = parseQuickText(
        mockTranscription,
        members.map(m => ({ id: m.id, name: m.displayName })),
        defaultCurrency
      );
      setParsedPreview(parsed);
    } finally {
      setIsProcessing(false);
    }
  }, [recorder, defaultCurrency, members, transcription, scaleAnim]);

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
    if (recorder.isRecording) {
      recorder.stop().catch(() => {});
    }
    clearInterval(durationInterval.current!);
    scaleAnim.setValue(1);
    setText('');
    setTranscription('');
    setParsedPreview(null);
    setMode('idle');
  }, [recorder, scaleAnim]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (mode === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={startVoiceRecording}>
            <Mic size={22} color={COLORS.kivo400} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openCamera}>
            <Camera size={22} color={COLORS.kivo400} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setMode('text_input')}>
            <PenLine size={22} color={COLORS.kivo400} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton}>
            <Plus size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === 'voice_recording') {
    return (
      <View style={styles.containerExpanded}>
        <View style={styles.recordingHeader}>
          <View style={styles.recDot} />
          <Text style={styles.recLabel}>GRABANDO</Text>
          <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>
          <TouchableOpacity onPress={cancel}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.waveformContainer}>
          {/* Simplified waveform visualization */}
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[styles.waveBar, { height: Math.random() * 40 + 10 }]}
            />
          ))}
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity style={styles.stopButton} onPress={stopVoiceRecording}>
            <Square size={20} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (mode === 'voice_preview') {
    return (
      <View style={styles.containerExpanded}>
        <View style={styles.previewHeader}>
          <Sparkles size={16} color={COLORS.ai} />
          <Text style={styles.previewTitle}>Kivo interpreta:</Text>
          <TouchableOpacity onPress={cancel}>
            <X size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {isProcessing ? (
          <Text style={styles.processingText}>Procesando…</Text>
        ) : (
          <View style={styles.parsedCard}>
            {parsedPreview?.description ? (
              <Text style={styles.parsedDescription}>{parsedPreview.description}</Text>
            ) : null}
            <Text style={styles.parsedDetails}>
              {parsedPreview?.amount != null ? `$${parsedPreview.amount}` : ''}
              {parsedPreview?.currency ? ` ${parsedPreview.currency}` : ''}
              {parsedPreview?.splitRule === 'equal' ? ' · División igual' : ''}
            </Text>
            {parsedPreview?.pendingReasons?.length ? (
              <Text style={styles.pendingLabel}>
                ⚠ Faltan: {parsedPreview.pendingReasons.join(', ')}
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.confirmButton} onPress={confirmEntry}>
            <Check size={18} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={cancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (mode === 'text_input') {
    return (
      <View style={styles.containerExpanded}>
        <View style={styles.textHeader}>
          <Text style={styles.textTitle}>Escribe rápido</Text>
          <TouchableOpacity onPress={cancel}>
            <X size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="uber 22 dividido entre 3…"
          placeholderTextColor={COLORS.textTertiary}
          value={text}
          onChangeText={handleTextChange}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={parsedPreview ? confirmEntry : undefined}
        />

        {parsedPreview && (
          <View style={styles.livePreview}>
            <Text style={styles.livePreviewText}>
              {parsedPreview.description ?? ''}
              {parsedPreview.amount != null ? ` · $${parsedPreview.amount}` : ''}
              {parsedPreview.splitRule === 'equal' ? ' · ÷ igual' : ''}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmButton, !parsedPreview && styles.buttonDisabled]}
          onPress={confirmEntry}
          disabled={!parsedPreview}
        >
          <Text style={styles.confirmButtonText}>Agregar →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgElevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  containerExpanded: {
    backgroundColor: COLORS.bgElevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDefault,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.kivo500,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  recLabel: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  duration: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 60,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.kivo400,
    opacity: 0.8,
  },
  stopButton: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.kivo600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    color: COLORS.ai,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  parsedCard: {
    backgroundColor: COLORS.aiMuted,
    borderWidth: 1,
    borderColor: COLORS.ai,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  parsedDescription: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  parsedDetails: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  pendingLabel: {
    color: COLORS.warning,
    fontSize: 12,
    marginTop: 4,
  },
  processingText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.kivo500,
    borderRadius: 12,
    paddingVertical: 13,
    gap: 6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  livePreview: {
    backgroundColor: COLORS.bgSelected,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.kivo400,
  },
  livePreviewText: {
    color: COLORS.kivo400,
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
