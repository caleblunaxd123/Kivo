import { create } from 'zustand';
import type { Group, Entry, GroupMember, MemberBalance } from '@kivo/shared';
import { supabase } from '../lib/supabase';

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
      const { data: groupData, error: groupErr } = await supabase.rpc('get_group_data', { p_group_id: groupId });

      if (!groupErr && groupData) {
        const raw = groupData as any;
        const group = raw.group ? mapGroup(raw.group) : null;
        const members = (raw.members ?? []).map(mapMember);
        set({ activeGroup: group, members });
      }

      const entriesRes = await supabase
        .from('entries')
        .select('*, entry_items(*), entry_splits(*), attachments(*)')
        .eq('group_id', groupId)
        .neq('status', 'archived')
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

      const pendingCount = entriesRes.data?.filter(
        e => e.status === 'pending_review'
      ).length ?? 0;

      set({ entries: entriesRes.data ?? [], pendingCount, isLoadingEntries: false });
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
