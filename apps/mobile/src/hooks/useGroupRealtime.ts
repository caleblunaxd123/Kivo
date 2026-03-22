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
  }, [groupId, subscribeToGroup, unsubscribeFromGroup]);
}
