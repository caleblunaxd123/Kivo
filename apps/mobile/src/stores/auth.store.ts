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
    // Idempotente — si ya se registró el listener, no hacer nada
    // (NO cambiar isLoading aquí para evitar flash prematuro)
    if ((useAuthStore as any)._authListenerRegistered) return;
    (useAuthStore as any)._authListenerRegistered = true;

    // Registrar el listener PRIMERO — Supabase v2 dispara INITIAL_SESSION
    // inmediatamente con la sesión almacenada, eliminando la necesidad de
    // llamar getSession() por separado y evitando la race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth]', event, session?.user?.email ?? 'no session');

      if (event === 'INITIAL_SESSION') {
        // App arrancó — sesión restaurada desde SecureStore (o null si no hay)
        if (session) {
          try {
            const { data: raw } = await supabase
              .from('users').select('*').eq('id', session.user.id).single();
            set({
              session, sessionUserId: session.user.id,
              user: raw ? mapUser(raw) : null,
              isAuthenticated: true, isLoading: false,
            });
          } catch {
            // Si falla la DB, igual autenticar con datos de Supabase Auth
            set({ session, sessionUserId: session.user.id, isAuthenticated: true, isLoading: false });
          }
        } else {
          // Sin sesión → mostrar onboarding
          set({ isLoading: false });
        }

      } else if (event === 'SIGNED_IN' && session) {
        // Login nuevo (OAuth o email)
        const userProfile = await upsertProfile(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name,
          session.user.app_metadata?.provider,
        );
        set({ session, sessionUserId: session.user.id, user: userProfile, isAuthenticated: true, isLoading: false });

      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Refresh silencioso — solo actualizar sesión, sin refetch de perfil
        set({ session, sessionUserId: session.user.id, isAuthenticated: true });

      } else if (event === 'USER_UPDATED' && session) {
        set({ session, isAuthenticated: true });

      } else if (event === 'SIGNED_OUT' || !session) {
        set({ session: null, sessionUserId: null, user: null, isAuthenticated: false, isLoading: false });
      }
    });

    (useAuthStore as any)._authUnsubscribe = subscription.unsubscribe.bind(subscription);
  },
}));
