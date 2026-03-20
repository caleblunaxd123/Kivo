import { create } from 'zustand';
import type { User } from '@kivo/shared';
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

  initialize: async () => {
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
    } catch {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const sessionUserId = session.user.id;
        const userProfile = await upsertProfile(
          sessionUserId,
          session.user.email!,
          session.user.user_metadata?.full_name,
          session.user.app_metadata?.provider,
        );
        set({ session, sessionUserId, user: userProfile, isAuthenticated: true });
      } else if (event === 'SIGNED_OUT') {
        set({ session: null, sessionUserId: null, user: null, isAuthenticated: false });
      }
    });
  },
}));
