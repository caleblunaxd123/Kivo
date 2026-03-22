import { create } from 'zustand';
import type { User } from '@vozpe/shared';
import { supabase } from '../lib/supabase';

// Supabase returns snake_case; our User type uses camelCase
function mapUser(raw: Record<string, any>): User {
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url ?? undefined,
    colorHex: raw.color_hex,
    preferredCurrency: raw.preferred_currency,
    preferredLocale: raw.preferred_locale,
    timezone: raw.timezone,
    theme: raw.theme,
    createdAt: raw.created_at,
    lastSeenAt: raw.last_seen_at ?? undefined,
  };
}

async function upsertProfile(userId: string, email: string, fullName?: string, provider?: string): Promise<User | null> {
  const displayName = fullName?.trim() || email.split('@')[0];
  const { data, error } = await supabase.from('users').upsert({
    id: userId,
    email,
    display_name: displayName,
    auth_provider: provider ?? 'email',
  }, { onConflict: 'id', ignoreDuplicates: false }).select().single();

  if (error) {
    // Fallback: try a plain select in case the row already exists
    const { data: existing } = await supabase.from('users').select('*').eq('id', userId).single();
    return existing ? mapUser(existing) : null;
  }
  return data ? mapUser(data) : null;
}

interface AuthState {
  user: User | null;
  sessionUserId: string | null;   // Always set from Supabase auth session
  session: unknown | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: unknown | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'displayName' | 'avatarUrl' | 'preferredCurrency' | 'timezone'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionUserId: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, sessionUserId: null, session: null, isAuthenticated: false });
  },

  updateProfile: async (updates) => {
    const payload: Record<string, any> = {};
    if (updates.displayName       !== undefined) payload.display_name       = updates.displayName;
    if (updates.avatarUrl         !== undefined) payload.avatar_url         = updates.avatarUrl;
    if (updates.preferredCurrency !== undefined) payload.preferred_currency = updates.preferredCurrency;
    if (updates.timezone          !== undefined) payload.timezone           = updates.timezone;

    const { data, error } = await supabase.rpc('update_profile', { p_updates: payload });
    if (error) throw new Error(error.message);
    if (data) set({ user: mapUser(data) });
  },

  initialize: async () => {
    // Prevent duplicate listeners if initialize() is called more than once
    if ((useAuthStore as any)._authListenerRegistered) {
      set({ isLoading: false });
      return;
    }
    (useAuthStore as any)._authListenerRegistered = true;

    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const sessionUserId = session.user.id;
        const { data: raw } = await supabase.from('users').select('*').eq('id', sessionUserId).single();
        set({
          session,
          sessionUserId,
          user: raw ? mapUser(raw) : null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      // Refresh token inválido/expirado → limpiar sesión del storage para no quedar en loop
      const isTokenError =
        err?.name === 'AuthApiError' ||
        err?.message?.toLowerCase().includes('refresh token') ||
        err?.message?.toLowerCase().includes('invalid token');
      if (isTokenError) {
        try { await supabase.auth.signOut(); } catch {}
      }
      set({ isLoading: false });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] onAuthStateChange:', event, session?.user?.id ?? 'no session');
      if (event === 'SIGNED_IN' && session) {
        // Primer login — hacer upsert del perfil
        const sessionUserId = session.user.id;
        const userProfile = await upsertProfile(
          sessionUserId,
          session.user.email!,
          session.user.user_metadata?.full_name,
          session.user.app_metadata?.provider,
        );
        set({ session, sessionUserId, user: userProfile, isAuthenticated: true });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Refresh silencioso — solo actualizar sesión, no refetch de perfil
        set({ session, sessionUserId: session.user.id, isAuthenticated: true });
      } else if (event === 'USER_UPDATED' && session) {
        set({ session, isAuthenticated: true });
      } else if (!session || event === 'SIGNED_OUT') {
        set({ session: null, sessionUserId: null, user: null, isAuthenticated: false });
      }
    });
    // Store unsubscribe fn so it can be cleaned up if needed
    (useAuthStore as any)._authUnsubscribe = subscription.unsubscribe.bind(subscription);
  },
}));
