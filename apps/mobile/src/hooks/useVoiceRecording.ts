import { useState, useCallback } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';

type RecordingState = 'idle' | 'recording' | 'processing';

interface UseVoiceRecordingResult {
  state: RecordingState;
  durationMs: number;
  startRecording: () => Promise<void>;
  stopAndTranscribe: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  metering: number; // dBFS, -160 to 0
}

export function useVoiceRecording(): UseVoiceRecordingResult {
  const [state, setState] = useState<RecordingState>('idle');

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Poll every 100 ms for live metering + duration
  const recorderState = useAudioRecorderState(recorder, 100);

  const metering = recorderState.metering ?? -160;
  const durationMs = recorderState.durationMillis;

  const startRecording = useCallback(async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return;

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setState('recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [recorder]);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    setState('processing');

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return null;

      // Read audio file as base64 and send to Whisper via Edge Function
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Clean up temp file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.functions.invoke('parse-entry', {
        body: {
          mode: 'transcribe',
          audioBase64,
          audioFormat: 'm4a',
        },
      });

      if (error) throw error;
      return (data?.transcription as string) ?? null;
    } catch (err) {
      console.error('Transcription failed:', err);
      return null;
    } finally {
      setState('idle');
    }
  }, [recorder]);

  const cancelRecording = useCallback(async () => {
    try {
      if (recorder.isRecording) {
        await recorder.stop();
        const uri = recorder.uri;
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch {
      // ignore cleanup errors
    }
    setState('idle');
  }, [recorder]);

  return { state, durationMs, startRecording, stopAndTranscribe, cancelRecording, metering };
}
