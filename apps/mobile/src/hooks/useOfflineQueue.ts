import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'vozpe:offline_queue';

interface QueuedOperation {
  id: string;
  type: 'create_entry' | 'update_entry' | 'delete_entry';
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

export function useOfflineQueue() {
  const processingRef = useRef(false);

  const getQueue = useCallback(async (): Promise<QueuedOperation[]> => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const setQueue = useCallback(async (queue: QueuedOperation[]) => {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, []);

  const enqueue = useCallback(async (op: Omit<QueuedOperation, 'id' | 'createdAt' | 'retries'>) => {
    const queue = await getQueue();
    const newOp: QueuedOperation = {
      ...op,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      retries: 0,
    };
    await setQueue([...queue, newOp]);
  }, [getQueue, setQueue]);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    const { supabase } = await import('../lib/supabase');
    const queue = await getQueue();

    if (queue.length === 0) {
      processingRef.current = false;
      return;
    }

    const remaining: QueuedOperation[] = [];

    for (const op of queue) {
      try {
        if (op.type === 'create_entry') {
          await supabase.from('entries').insert(op.payload);
        } else if (op.type === 'update_entry') {
          const { id, ...updates } = op.payload;
          await supabase.from('entries').update(updates).eq('id', id);
        } else if (op.type === 'delete_entry') {
          await supabase.from('entries').delete().eq('id', op.payload.id);
        }
      } catch {
        if (op.retries < 5) {
          remaining.push({ ...op, retries: op.retries + 1 });
        }
      }
    }

    await setQueue(remaining);
    processingRef.current = false;
  }, [getQueue, setQueue]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        processQueue();
      }
    });
    processQueue();
    return () => subscription.remove();
  }, [processQueue]);

  return { enqueue, processQueue };
}
