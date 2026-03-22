/**
 * useGroupRealtime — thin wrapper around the group store's subscribeToGroup.
 * The store manages the actual Supabase channel; this hook is kept for
 * components that want to trigger realtime subscription declaratively.
 *
 * NOTE: GroupScreen uses setActiveGroup() which already calls subscribeToGroup
 * internally, so this hook is only needed in non-group-screen contexts.
 */
import { useEffect } from 'react';
import { useGroupStore } from '../stores/group.store';

export function useGroupRealtime(groupId: string | null) {
  const subscribeToGroup   = useGroupStore(s => s.subscribeToGroup);
  const unsubscribeFromGroup = useGroupStore(s => s.unsubscribeFromGroup);

  useEffect(() => {
    if (!groupId) return;
    subscribeToGroup(groupId);
    return () => { unsubscribeFromGroup(); };
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
