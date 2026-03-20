import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useGroupStore } from '../stores/group.store';
import type { Entry, EntryCategory, EntryType, SplitRule } from '@kivo/shared';

/**
 * Subscribes to realtime changes for a group and keeps the store in sync.
 * Handles entry inserts, updates (including status changes), and deletes.
 */
export function useGroupRealtime(groupId: string | null) {
  const { addEntryOptimistic, updateEntryOptimistic, removeEntry } = useGroupStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!groupId) return;

    // Unsubscribe previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'entries',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const entry = mapPayloadToEntry(payload.new);
          // addEntryOptimistic will de-dupe by id
          addEntryOptimistic(entry);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'entries',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const entry = mapPayloadToEntry(payload.new);
          updateEntryOptimistic(entry.id, entry);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'entries',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.old?.id) {
            removeEntry(payload.old.id as string);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);
}

function mapPayloadToEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as string,
    groupId: row.group_id as string,
    createdBy: row.created_by as string,
    type: (row.type as EntryType) ?? 'expense',
    paidBy: row.paid_by as string | undefined,
    description: row.description as string,
    amount: row.amount as number,
    currency: row.currency as string,
    amountInBase: row.amount_in_base as number | undefined,
    category: (row.category as EntryCategory) ?? 'other',
    splitRule: (row.split_rule as SplitRule) ?? 'equal',
    status: row.status as Entry['status'],
    pendingReasons: (row.pending_reasons as Entry['pendingReasons']) ?? [],
    entryDate: row.entry_date as string,
    rawInput: row.raw_input as string | undefined,
    origin: row.origin as Entry['origin'],
    confirmedAt: row.confirmed_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    attachmentCount: (row.attachment_count as number) ?? 0,
    sortOrder: (row.sort_order as number) ?? 0,
    splits: [],
    items: [],
    attachments: [],
  };
}
