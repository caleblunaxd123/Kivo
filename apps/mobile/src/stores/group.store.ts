import { create } from 'zustand';
import type { Group, Entry, GroupMember, MemberBalance, EntryType, EntryCategory, SplitRule } from '@kivo/shared';
import { supabase } from '../lib/supabase';

/** Maps a raw DB row (snake_case) coming from Realtime into a typed Entry (camelCase). */
function mapRealtimeEntry(row: Record<string, unknown>): Entry {
  return {
    id:              row.id as string,
    groupId:         row.group_id as string,
    createdBy:       row.created_by as string | undefined,
    type:            (row.type as EntryType) ?? 'expense',
    status:          row.status as Entry['status'],
    origin:          row.origin as Entry['origin'],
    description:     (row.description as string) ?? '',
    notes:           row.notes as string | undefined,
    category:        (row.category as EntryCategory) ?? 'other',
    amount:          row.amount as number,
    currency:        row.currency as string,
    amountInBase:    row.amount_in_base as number | undefined,
    exchangeRate:    row.exchange_rate as number | undefined,
    paidBy:          row.paid_by as string | undefined,
    splitRule:       (row.split_rule as SplitRule) ?? 'equal',
    aiConfidence:    row.ai_confidence as number | undefined,
    rawInput:        row.raw_input as string | undefined,
    entryDate:       row.entry_date as string,
    confirmedAt:     row.confirmed_at as string | undefined,
    pendingReasons:  (row.pending_reasons as Entry['pendingReasons']) ?? [],
    attachmentCount: (row.attachment_count as number) ?? 0,
    sortOrder:       (row.sort_order as number) ?? 0,
    createdAt:       row.created_at as string,
    updatedAt:       row.updated_at as string,
    splits: [],
    items: [],
    attachments: [],
  };
}

function mapMember(m: any): GroupMember {
  return {
    id: m.id,
    groupId: m.group_id ?? m.groupId,
    userId: m.user_id ?? m.userId,
    role: m.role,
    status: m.status,
    joinedAt: m.joined_at ?? m.joinedAt ?? new Date().toISOString(),
    displayName: m.display_name ?? m.displayName ?? m.email ?? 'Unknown',
    colorHex: m.color_hex ?? m.colorHex ?? '#6366F1',
    avatarUrl: m.avatar_url ?? m.avatarUrl,
  };
}

function mapGroup(raw: any, members?: any[]): Group {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    coverEmoji: raw.cover_emoji ?? raw.coverEmoji ?? '📋',
    coverImageUrl: raw.cover_image_url ?? raw.coverImageUrl,
    baseCurrency: raw.base_currency ?? raw.baseCurrency ?? 'USD',
    status: raw.status ?? 'active',
    ownerId: raw.owner_id ?? raw.ownerId,
    timezone: raw.timezone ?? 'America/Lima',
    countryCode: raw.country_code ?? raw.countryCode,
    description: raw.description,
    defaultSplitRule: raw.default_split_rule ?? raw.defaultSplitRule ?? 'equal',
    allowPending: raw.allow_pending ?? raw.allowPending ?? true,
    offlineMode: raw.offline_mode ?? raw.offlineMode ?? true,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
    closedAt: raw.closed_at ?? raw.closedAt,
    members: members?.map(mapMember),
    totalAmount: raw.totalAmount ?? 0,
    pendingCount: raw.pendingCount ?? 0,
  };
}

interface GroupState {
  // Data
  groups: Group[];
  activeGroupId: string | null;
  activeGroup: Group | null;
  entries: Entry[];
  members: GroupMember[];
  balances: MemberBalance[];
  pendingCount: number;
  // Loading states
  isLoadingGroups: boolean;
  isLoadingEntries: boolean;
  // Realtime
  realtimeChannel: ReturnType<typeof supabase.channel> | null;

  // Actions
  setActiveGroup: (groupId: string | null) => void;
  fetchGroups: () => Promise<void>;
  fetchGroupData: (groupId: string) => Promise<void>;
  addEntryOptimistic: (entry: Partial<Entry>) => void;
  updateEntryOptimistic: (id: string, updates: Partial<Entry>) => void;
  removeEntry: (id: string) => void;
  // Group management
  archiveGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  // Entry mutations (via RPC)
  updateEntry: (entryId: string, updates: Partial<Entry>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  // Realtime
  subscribeToGroup: (groupId: string) => void;
  unsubscribeFromGroup: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroupId: null,
  activeGroup: null,
  entries: [],
  members: [],
  balances: [],
  pendingCount: 0,
  isLoadingGroups: false,
  isLoadingEntries: false,
  realtimeChannel: null,

  setActiveGroup: (groupId) => {
    set({ activeGroupId: groupId });
    if (groupId) {
      get().fetchGroupData(groupId);
      get().subscribeToGroup(groupId);
    } else {
      set({ activeGroup: null, entries: [], members: [], balances: [], pendingCount: 0 });
      get().unsubscribeFromGroup();
    }
  },

  fetchGroups: async () => {
    set({ isLoadingGroups: true });
    try {
      const { data, error } = await supabase.rpc('get_my_groups');
      if (!error && Array.isArray(data)) {
        const groups = data.map((row: any) => mapGroup(row.group, row.members ?? []));
        set({ groups });
      }
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  fetchGroupData: async (groupId) => {
    set({ isLoadingEntries: true });
    try {
      // ── 1. Fetch group + members via SECURITY DEFINER (bypasses RLS) ──
      const { data: groupData, error: groupErr } = await supabase.rpc('get_group_data', { p_group_id: groupId });

      if (groupErr) {
        console.error('[fetchGroupData] get_group_data error:', groupErr);
      }

      if (!groupErr && groupData) {
        const raw = groupData as any;
        const group = raw.group ? mapGroup(raw.group) : null;
        const members = (raw.members ?? []).map(mapMember);
        set({ activeGroup: group, members });
      } else if (groupErr) {
        // Fallback: direct table query (may return empty if RLS blocks, but worth trying)
        const { data: fallback, error: fbErr } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
        if (!fbErr && fallback) {
          set({ activeGroup: mapGroup(fallback), members: [] });
        } else {
          console.error('[fetchGroupData] fallback query error:', fbErr);
        }
      }

      // ── 2. Fetch entries via SECURITY DEFINER ──
      const { data: entriesData, error: entriesErr } = await supabase
        .rpc('get_group_entries', { p_group_id: groupId });

      if (entriesErr) {
        console.error('[fetchGroupData] get_group_entries error:', entriesErr);
        // Fallback to direct query (RLS may block, but try anyway)
        const { data: fallbackEntries } = await supabase
          .from('entries')
          .select('*, entry_items(*), entry_splits(*), attachments(*)')
          .eq('group_id', groupId)
          .neq('status', 'archived')
          .order('entry_date', { ascending: false });
        const pendingCount = fallbackEntries?.filter(e => e.status === 'pending_review').length ?? 0;
        set({ entries: fallbackEntries ?? [], pendingCount, isLoadingEntries: false });
      } else {
        const entries = Array.isArray(entriesData) ? entriesData : [];
        const pendingCount = entries.filter((e: any) => e.status === 'pending_review').length;
        set({ entries, pendingCount, isLoadingEntries: false });
      }
    } catch (err) {
      console.error('[fetchGroupData] unexpected error:', err);
      set({ isLoadingEntries: false });
    }
  },

  addEntryOptimistic: (entry) => {
    const tempId = `temp_${Date.now()}`;
    const optimisticEntry: Entry = {
      id: tempId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entryDate: new Date().toISOString().split('T')[0],
      pendingReasons: [],
      attachmentCount: 0,
      sortOrder: 0,
      ...entry,
    } as Entry;

    set(state => ({
      entries: [optimisticEntry, ...state.entries],
    }));
  },

  updateEntryOptimistic: (id, updates) => {
    set(state => ({
      entries: state.entries.map(e =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      ),
    }));
  },

  removeEntry: (id) => {
    set(state => ({
      entries: state.entries.filter(e => e.id !== id),
      pendingCount: state.entries.filter(e => e.id !== id && e.status === 'pending_review').length,
    }));
  },

  archiveGroup: async (groupId) => {
    const { error } = await supabase.rpc('archive_group', { p_group_id: groupId });
    if (error) throw new Error(error.message);
    // Remove from local groups list
    set(state => ({
      groups: state.groups.filter(g => g.id !== groupId),
    }));
  },

  leaveGroup: async (groupId) => {
    const { error } = await supabase.rpc('leave_group', { p_group_id: groupId });
    if (error) throw new Error(error.message);
    // Remove from local groups list
    set(state => ({
      groups: state.groups.filter(g => g.id !== groupId),
    }));
  },

  updateEntry: async (entryId, updates) => {
    // Optimistic update first
    get().updateEntryOptimistic(entryId, updates);

    // Build the jsonb payload for the RPC
    const payload: Record<string, any> = {};
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.amount       !== undefined) payload.amount      = updates.amount;
    if (updates.currency     !== undefined) payload.currency    = updates.currency;
    if (updates.category     !== undefined) payload.category    = updates.category;
    if (updates.paidBy       !== undefined) payload.paid_by     = updates.paidBy;
    if (updates.splitRule    !== undefined) payload.split_rule  = updates.splitRule;
    if (updates.notes        !== undefined) payload.notes       = updates.notes;
    if (updates.status       !== undefined) payload.status      = updates.status;
    if (updates.entryDate    !== undefined) payload.entry_date  = updates.entryDate;
    if (updates.pendingReasons !== undefined) payload.pending_reasons = updates.pendingReasons;

    const { error } = await supabase.rpc('update_entry', {
      p_entry_id: entryId,
      p_updates: payload,
    });
    if (error) {
      // Revert optimistic update on failure
      console.error('[updateEntry] error:', error);
      throw new Error(error.message);
    }
    // Recalculate pendingCount
    set(state => ({
      pendingCount: state.entries.filter(e => e.status === 'pending_review').length,
    }));
  },

  deleteEntry: async (entryId) => {
    // Optimistic remove
    get().removeEntry(entryId);

    const { error } = await supabase.rpc('delete_entry', { p_entry_id: entryId });
    if (error) {
      console.error('[deleteEntry] error:', error);
      throw new Error(error.message);
    }
  },

  subscribeToGroup: (groupId) => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entries', filter: `group_id=eq.${groupId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEntry = mapRealtimeEntry(payload.new as Record<string, unknown>);
            set(state => ({
              entries: [
                newEntry,
                // Remove any optimistic temp entry and avoid duplicates
                ...state.entries.filter(e => !e.id.startsWith('temp_') && e.id !== newEntry.id),
              ],
              pendingCount: state.entries.filter(e => e.status === 'pending_review').length,
            }));
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapRealtimeEntry(payload.new as Record<string, unknown>);
            set(state => ({
              entries: state.entries.map(e => e.id === updated.id ? { ...e, ...updated } : e),
              pendingCount: state.entries.filter(e =>
                e.id === updated.id ? updated.status === 'pending_review' : e.status === 'pending_review'
              ).length,
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            set(state => ({
              entries: state.entries.filter(e => e.id !== deletedId),
              pendingCount: state.entries.filter(e => e.id !== deletedId && e.status === 'pending_review').length,
            }));
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeFromGroup: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },
}));
