import { create } from 'zustand';
import type { Group, Entry, GroupMember, MemberBalance } from '@kivo/shared';
import { supabase } from '../lib/supabase';

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
      get().unsubscribeFromGroup();
    }
  },

  fetchGroups: async () => {
    set({ isLoadingGroups: true });
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(
            id, role, status,
            user:users(id, display_name, avatar_url, color_hex)
          )
        `)
        .eq('group_members.status', 'active')
        .neq('status', 'archived')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        set({ groups: data });
      }
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  fetchGroupData: async (groupId) => {
    set({ isLoadingEntries: true });
    try {
      const [entriesRes, membersRes] = await Promise.all([
        supabase
          .from('entries')
          .select('*, entry_items(*), entry_splits(*), attachments(*)')
          .eq('group_id', groupId)
          .neq('status', 'archived')
          .order('entry_date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('group_members')
          .select('*, user:users(id, display_name, avatar_url, color_hex, email)')
          .eq('group_id', groupId)
          .eq('status', 'active'),
      ]);

      const pendingCount = entriesRes.data?.filter(
        e => e.status === 'pending_review'
      ).length ?? 0;

      set({
        entries: entriesRes.data ?? [],
        members: membersRes.data ?? [],
        pendingCount,
        isLoadingEntries: false,
      });
    } catch {
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
            set(state => ({
              entries: [payload.new as Entry, ...state.entries.filter(e => !e.id.startsWith('temp_'))],
            }));
          } else if (payload.eventType === 'UPDATE') {
            set(state => ({
              entries: state.entries.map(e =>
                e.id === (payload.new as Entry).id ? { ...e, ...payload.new as Entry } : e
              ),
            }));
          } else if (payload.eventType === 'DELETE') {
            set(state => ({
              entries: state.entries.filter(e => e.id !== (payload.old as { id: string }).id),
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
