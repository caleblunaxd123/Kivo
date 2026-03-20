import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

const QUEUE_KEY = 'kivo:offline_queue';

interface QueuedOperation {
  id: string;
  type: 'create_entry' | 'update_entry' | 'delete_entry';
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

export function useOfflineQueue() {
  const [queueRaw, setQueueRaw] = useMMKVString(QUEUE_KEY);
  const processingRef = useRef(false);

  const getQueue = useCallback((): QueuedOperation[] => {
    if (!queueRaw) return [];
    try {
      return JSON.parse(queueRaw);
    } catch {
      return [];
    }
  }, [queueRaw]);

  const enqueue = useCallback((op: Omit<QueuedOperation, 'id' | 'createdAt' | 'retries'>) => {
    const queue = getQueue();
    const newOp: QueuedOperation = {
      ...op,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      retries: 0,
    };
    setQueueRaw(JSON.stringify([...queue, newOp]));
  }, [getQueue, setQueueRaw]);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    const { supabase } = await import('../lib/supabase');
    const queue = getQueue();
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
        // Success — don't add back to queue
      } catch {
        // Failed — re-queue with backoff if under max retries
        if (op.retries < 5) {
          remaining.push({ ...op, retries: op.retries + 1 });
        }
        // After 5 retries, drop the operation
      }
    }

    setQueueRaw(JSON.stringify(remaining));
    processingRef.current = false;
  }, [getQueue, setQueueRaw]);

  // Process queue when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        processQueue();
      }
    });

    // Also process on mount
    processQueue();

    return () => subscription.remove();
  }, [processQueue]);

  const queueLength = getQueue().length;

  return { enqueue, processQueue, queueLength };
}
