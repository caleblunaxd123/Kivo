'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../lib/supabase';

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', name: 'Dólar estadounidense' },
  { code: 'PEN', flag: '🇵🇪', name: 'Sol peruano'           },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro'                  },
  { code: 'CLP', flag: '🇨🇱', name: 'Peso chileno'          },
  { code: 'COP', flag: '🇨🇴', name: 'Peso colombiano'       },
  { code: 'MXN', flag: '🇲🇽', name: 'Peso mexicano'        },
];

export default function SettingsPage() {
  const supabase = getSupabaseClient();

  const [displayName,   setDisplayName]   = useState('');
  const [currency,      setCurrency]      = useState('USD');
  const [email,         setEmail]         = useState('');
  const [userId,        setUserId]        = useState('');
  const [createdAt,     setCreatedAt]     = useState('');
  const [saving,        setSaving]        = useState(false);
  const [savedOk,       setSavedOk]       = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');
      setUserId(user.id);

      const { data } = await supabase
        .from('users')
        .select('display_name, preferred_currency, created_at')
        .eq('id', user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name ?? '');
        setCurrency(data.preferred_currency ?? 'USD');
        setCreatedAt(data.created_at ?? '');
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    setError('');
    setSavedOk(false);

    const { error: rpcError } = await supabase.rpc('update_profile', {
      p_updates: {
        display_name:       displayName.trim(),
        preferred_currency: currency,
      },
    });

    setSaving(false);
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-lg animate-pulse">
        <div className="h-8 bg-bg-elevated rounded-xl w-40 mb-8" />
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-bg-elevated rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Ajustes</h1>
        <p className="text-text-tertiary text-sm mt-1">Personaliza tu perfil y preferencias</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Perfil */}
        <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Perfil</h2>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">Nombre para mostrar</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border-default focus:border-vozpe-500 focus:outline-none focus:ring-2 focus:ring-vozpe-500/20 text-text-primary placeholder-text-tertiary text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">Correo electrónico</label>
            <div className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary text-sm font-mono select-all">
              {email}
            </div>
            <p className="text-text-tertiary text-xs">El correo se gestiona desde tu proveedor de autenticación.</p>
          </div>
        </section>

        {/* Preferencias */}
        <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Preferencias</h2>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">Moneda por defecto</label>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    currency === c.code
                      ? 'border-vozpe-500 bg-vozpe-50 text-vozpe-600'
                      : 'border-border-default bg-bg-base text-text-secondary hover:border-vozpe-500/50'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="font-mono font-bold">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Cuenta */}
        <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Cuenta</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">ID de usuario</span>
            <span className="text-xs font-mono text-text-tertiary bg-bg-elevated px-3 py-1 rounded-full border border-border-subtle">
              {userId.slice(0, 8)}…
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Miembro desde</span>
            <span className="text-sm text-text-tertiary">
              {createdAt
                ? new Date(createdAt).toLocaleDateString('es', { month: 'long', year: 'numeric' })
                : '—'}
            </span>
          </div>
        </section>

        {/* Feedback + submit */}
        {error && (
          <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {savedOk && (
          <p className="text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3">
            ✓ Cambios guardados correctamente
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !displayName.trim()}
          className="w-full py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-btn"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
