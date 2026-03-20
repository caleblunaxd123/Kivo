import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
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
  const [durationMs, setDurationMs] = useState(0);
  const [metering, setMetering] = useState(-160);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.metering !== undefined) {
            setMetering(status.metering);
          }
        },
        100 // metering interval ms
      );

      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setState('recording');

      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, []);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    if (!recordingRef.current) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState('processing');
    setMetering(-160);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) return null;

      // Read the audio file and send to transcription
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Clean up temp file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      // Send to Supabase Edge Function for Whisper transcription
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
      setDurationMs(0);
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // ignore cleanup errors
      }
      recordingRef.current = null;
    }
    setState('idle');
    setDurationMs(0);
    setMetering(-160);
  }, []);

  return { state, durationMs, startRecording, stopAndTranscribe, cancelRecording, metering };
}
