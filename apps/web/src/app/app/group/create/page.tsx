'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '../../../../lib/supabase';

const GROUP_TYPES = [
  { type: 'travel',   label: 'Viaje',    emoji: '✈️' },
  { type: 'home',     label: 'Hogar',    emoji: '🏠' },
  { type: 'shopping', label: 'Compras',  emoji: '🛒' },
  { type: 'work',     label: 'Trabajo',  emoji: '💼' },
  { type: 'event',    label: 'Evento',   emoji: '🎉' },
  { type: 'general',  label: 'General',  emoji: '📋' },
];

const CURRENCIES = [
  { code: 'USD', label: 'USD · Dólar' },
  { code: 'PEN', label: 'PEN · Sol' },
  { code: 'EUR', label: 'EUR · Euro' },
  { code: 'CLP', label: 'CLP · Peso CL' },
];

export default function CreateGroupPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [name,     setName]     = useState('');
  const [type,     setType]     = useState('travel');
  const [currency, setCurrency] = useState('USD');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const selectedType = GROUP_TYPES.find(t => t.type === type) ?? GROUP_TYPES[0];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Sesión expirada. Recarga la página.');
      setLoading(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc('create_group_with_owner', {
      p_name:          name.trim(),
      p_type:          type,
      p_cover_emoji:   selectedType.emoji,
      p_base_currency: currency,
      p_owner_id:      user.id,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    const groupId = (data as any)?.id as string | undefined;
    if (!groupId) {
      setError('No se obtuvo el ID del grupo creado.');
      setLoading(false);
      return;
    }

    router.push(`/app/group/${groupId}`);
  }

  return (
    <div className="p-8 max-w-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <Link href="/app" className="text-text-tertiary hover:text-text-primary transition-colors font-medium">
          ← Grupos
        </Link>
        <span className="text-border-default">/</span>
        <span className="text-text-primary font-semibold">Crear grupo</span>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-6 tracking-tight">Nuevo grupo</h1>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Emoji preview */}
        <div className="flex items-center justify-center py-4">
          <div className="w-20 h-20 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center text-4xl shadow-card">
            {selectedType.emoji}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Nombre del grupo
          </label>
          <input
            type="text"
            placeholder="Ej: Viaje a Chile…"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={60}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border-default focus:border-vozpe-500 focus:outline-none focus:ring-2 focus:ring-vozpe-500/20 text-text-primary placeholder-text-tertiary transition-all text-sm"
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Tipo
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GROUP_TYPES.map(t => (
              <button
                key={t.type}
                type="button"
                onClick={() => setType(t.type)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-sm font-medium ${
                  type === t.type
                    ? 'border-vozpe-500 bg-vozpe-500/10 text-vozpe-600'
                    : 'border-border-default bg-bg-surface text-text-secondary hover:border-vozpe-500/50 hover:bg-bg-elevated'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Moneda base
          </label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                  currency === c.code
                    ? 'border-vozpe-500 bg-vozpe-500/10 text-vozpe-600'
                    : 'border-border-default bg-bg-surface text-text-secondary hover:border-vozpe-500/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-danger text-sm bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/app"
            className="flex-1 py-3 rounded-xl border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong text-sm font-medium text-center transition-colors bg-bg-surface"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-btn"
          >
            {loading ? 'Creando…' : 'Crear grupo'}
          </button>
        </div>
      </form>
    </div>
  );
}
