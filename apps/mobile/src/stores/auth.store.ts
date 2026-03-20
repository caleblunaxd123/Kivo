import { create } from 'zustand';
import type { User } from '@kivo/shared';
import { supabase } from '../lib/supabase';

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
        // Try to get profile, but don't block auth if table doesn't exist yet
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUserId)
          .single();

        set({
          session,
          sessionUserId,
          user: userProfile ?? null,
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

        // Auto-create profile if it doesn't exist (e.g. first login after signup)
        await supabase.from('users').upsert({
          id: sessionUserId,
          email: session.user.email!,
          display_name:
            session.user.user_metadata?.full_name ??
            session.user.email!.split('@')[0],
          auth_provider: session.user.app_metadata?.provider ?? 'email',
        }, { onConflict: 'id', ignoreDuplicates: true });

        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUserId)
          .single();

        set({ session, sessionUserId, user: userProfile ?? null, isAuthenticated: true });
      } else if (event === 'SIGNED_OUT') {
        set({ session: null, sessionUserId: null, user: null, isAuthenticated: false });
      }
    });
  },
}));
