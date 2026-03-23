'use client';

import { useState } from 'react';
import { formatCurrency, formatDate } from '@vozpe/shared';
import { getSupabaseClient } from '../../../../lib/supabase';

type Tab = 'entries' | 'balance' | 'members';

const CATEGORY_EMOJI: Record<string, string> = {
  transport: '🚗', food: '🍽', accommodation: '🏨',
  shopping: '🛒', entertainment: '🎉', travel: '✈️',
  health: '💊', utilities: '⚡', other: '📦',
};

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
  display_name?: string;
  user?: { id: string; display_name: string; avatar_url?: string };
}

interface Entry {
  id: string;
  description: string;
  category?: string;
  amount: number;
  currency: string;
  amount_in_base?: number;
  entry_date?: string;
  status: string;
  paid_by?: string;
}

interface Group {
  id: string;
  name: string;
  base_currency: string;
  type: string;
}

interface GroupClientProps {
  group: Group;
  initialEntries: Entry[];
  members: Member[];
}

function getMemberName(member: Member): string {
  return member.user?.display_name ?? member.display_name ?? 'Usuario';
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'];

function getAvatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + (h << 5) - h;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function GroupClient({ group, initialEntries, members }: GroupClientProps) {
  const supabase = getSupabaseClient();
  const [tab, setTab] = useState<Tab>('entries');
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [quickAdd, setQuickAdd] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const confirmedTotal = entries
    .filter(e => e.status === 'confirmed')
    .reduce((sum, e) => sum + (e.amount_in_base ?? e.amount), 0);
  const pendingCount = entries.filter(e => e.status === 'pending_review').length;

  // ── Quick add ─────────────────────────────────────────────────────
  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickAdd.trim()) return;
    setAdding(true);
    setAddError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAddError('Sesión expirada'); setAdding(false); return; }

    const { data, error } = await supabase
      .from('entries')
      .insert({
        group_id: group.id,
        description: quickAdd.trim(),
        amount: 0,
        currency: group.base_currency,
        status: 'pending_review',
        paid_by: user.id,
        origin: 'manual',
        entry_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    setAdding(false);
    if (error) {
      setAddError(error.message);
    } else {
      setEntries(prev => [data as Entry, ...prev]);
      setQuickAdd('');
    }
  }

  // ── Confirm entry ───────────────────────────────────────────────
  async function handleConfirm(entryId: string) {
    const { error } = await supabase
      .from('entries')
      .update({ status: 'confirmed' })
      .eq('id', entryId);

    if (!error) {
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: 'confirmed' } : e));
    }
  }

  // ── Delete entry ─────────────────────────────────────────────────
  async function handleDelete(entryId: string) {
    const { error } = await supabase
      .from('entries')
      .update({ status: 'archived' })
      .eq('id', entryId);

    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== entryId));
    }
  }

  // ── Export CSV ───────────────────────────────────────────────────
  function handleExportCSV() {
    const headers = ['#', 'Descripción', 'Categoría', 'Monto', 'Moneda', 'Fecha', 'Estado'];
    const rows = entries.map((e, i) => [
      i + 1,
      e.description || '',
      e.category || '',
      e.amount,
      e.currency,
      e.entry_date ? formatDate(e.entry_date) : '',
      e.status === 'confirmed' ? 'Confirmado' : 'Pendiente',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${group.name.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Balance calculation (simplified) ─────────────────────────────
  const memberBalances = members.map(m => {
    const memberId = m.user_id ?? m.id;
    const paid = entries
      .filter(e => e.status === 'confirmed' && e.paid_by === memberId)
      .reduce((s, e) => s + (e.amount_in_base ?? e.amount), 0);
    const share = confirmedTotal / (members.length || 1);
    return {
      member: m,
      name: getMemberName(m),
      paid,
      share,
      balance: paid - share,
    };
  }).sort((a, b) => b.balance - a.balance);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-border-subtle bg-bg-surface">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-vozpe-50 border border-vozpe-200 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-vozpe-600 font-medium mb-0.5">Total confirmado</p>
            <p className="text-lg font-bold text-text-primary font-mono">{formatCurrency(confirmedTotal, group.base_currency)}</p>
          </div>
          <div className="bg-bg-base border border-border-subtle rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-text-tertiary font-medium mb-0.5">Entradas</p>
            <p className="text-lg font-bold text-text-primary">{entries.length}</p>
          </div>
          <div className={`rounded-xl px-4 py-3 text-center border ${pendingCount > 0 ? 'bg-warning/10 border-warning/20' : 'bg-bg-base border-border-subtle'}`}>
            <p className={`text-xs font-medium mb-0.5 ${pendingCount > 0 ? 'text-warning' : 'text-text-tertiary'}`}>Pendientes</p>
            <p className={`text-lg font-bold ${pendingCount > 0 ? 'text-warning' : 'text-text-primary'}`}>{pendingCount}</p>
          </div>
        </div>

        {/* Tabs + actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex rounded-xl bg-bg-base border border-border-subtle p-0.5 text-xs font-semibold">
            {(['entries', 'balance', 'members'] as Tab[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  tab === t
                    ? 'bg-vozpe-500 text-white shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                {t === 'entries' ? '📋 Entradas' : t === 'balance' ? '⚖️ Balance' : '👥 Miembros'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-default text-text-secondary hover:border-vozpe-500 hover:text-vozpe-600 text-xs font-semibold transition-all bg-bg-surface whitespace-nowrap"
          >
            📤 CSV
          </button>
        </div>
      </div>

      {/* Quick add form (only on entries tab) */}
      {tab === 'entries' && (
        <form onSubmit={handleQuickAdd} className="flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 bg-bg-surface border-b border-border-subtle">
          <input
            type="text"
            placeholder="Ej: Taxi 40 soles, almuerzo 25, hotel 2 noches 200…"
            value={quickAdd}
            onChange={e => setQuickAdd(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-bg-input border border-border-default focus:border-vozpe-500 focus:outline-none focus:ring-2 focus:ring-vozpe-500/20 text-text-primary placeholder-text-tertiary text-sm transition-all"
          />
          <button
            type="submit"
            disabled={adding || !quickAdd.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-btn whitespace-nowrap"
          >
            {adding ? '…' : '+ Agregar'}
          </button>
          {addError && <p className="text-danger text-xs">{addError}</p>}
        </form>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto">

        {/* ── Entries tab ──────────────────────────────────────────── */}
        {tab === 'entries' && (
          entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-24">
              <div className="text-5xl">📋</div>
              <p className="text-text-primary font-semibold">La hoja está vacía</p>
              <p className="text-text-tertiary text-sm">Agrega tu primera entrada arriba o desde la app móvil.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-surface border-b border-border-default z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs w-10">#</th>
                  <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs">Descripción</th>
                  <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs hidden md:table-cell">Pagó</th>
                  <th className="px-4 py-3 text-right text-text-tertiary font-semibold text-xs">Monto</th>
                  <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs hidden lg:table-cell">Fecha</th>
                  <th className="px-4 py-3 text-center text-text-tertiary font-semibold text-xs">Estado</th>
                  <th className="px-4 py-3 text-center text-text-tertiary font-semibold text-xs w-20">Acción</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isPending = entry.status === 'pending_review';
                  const paidBy = members.find(m =>
                    (m.user_id && m.user_id === entry.paid_by) || m.id === entry.paid_by
                  );
                  const catEmoji = CATEGORY_EMOJI[entry.category ?? ''] ?? '📦';

                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-border-subtle transition-colors ${
                        isPending
                          ? 'bg-warning/5 hover:bg-warning/8'
                          : 'hover:bg-bg-elevated'
                      }`}
                    >
                      <td className="px-4 py-3 text-text-tertiary text-xs font-mono">{i + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <div className="w-1 h-4 rounded-full bg-warning flex-shrink-0" />
                          )}
                          <span className="text-text-primary font-medium">
                            {entry.description || <span className="text-text-tertiary italic">Sin descripción</span>}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-text-secondary text-xs">
                          {catEmoji} {entry.category ?? '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-text-secondary text-sm hidden md:table-cell">
                        {paidBy ? getMemberName(paidBy) : '—'}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                        {entry.amount > 0 ? formatCurrency(entry.amount, entry.currency) : (
                          <span className="text-text-tertiary font-normal">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-text-tertiary text-xs font-mono hidden lg:table-cell">
                        {formatDate(entry.entry_date)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isPending
                              ? 'bg-warning/10 text-warning border border-warning/20'
                              : 'bg-success/10 text-success border border-success/20'
                          }`}
                        >
                          {isPending ? '⏳ Pendiente' : '✓ OK'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isPending && (
                            <button
                              onClick={() => handleConfirm(entry.id)}
                              title="Confirmar entrada"
                              className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(entry.id)}
                            title="Archivar entrada"
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/5 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="sticky bottom-0 bg-bg-elevated border-t-2 border-border-default">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-text-tertiary text-xs font-medium">
                    {entries.length} fila{entries.length !== 1 ? 's' : ''}
                    {pendingCount > 0 && ` · ${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-vozpe-500 text-base">
                    {formatCurrency(confirmedTotal, group.base_currency)}
                  </td>
                  <td colSpan={3} className="px-4 py-3 text-text-tertiary text-xs">
                    confirmado
                  </td>
                </tr>
              </tfoot>
            </table>
          )
        )}

        {/* ── Balance tab ──────────────────────────────────────────── */}
        {tab === 'balance' && (
          <div className="p-6 max-w-2xl mx-auto space-y-4">
            <div className="bg-vozpe-50 border border-vozpe-200 rounded-2xl p-4 text-center mb-6">
              <p className="text-xs text-vozpe-600 font-medium mb-1">Total del grupo ({group.base_currency})</p>
              <p className="text-3xl font-extrabold text-text-primary font-mono">{formatCurrency(confirmedTotal, group.base_currency)}</p>
              <p className="text-xs text-text-tertiary mt-1">Dividido entre {members.length} miembro{members.length !== 1 ? 's' : ''}</p>
            </div>

            {memberBalances.map(mb => (
              <div key={mb.member.id} className={`p-4 rounded-2xl border transition-colors ${mb.balance > 0.01 ? 'bg-success/5 border-success/20' : mb.balance < -0.01 ? 'bg-danger/5 border-danger/20' : 'bg-bg-surface border-border-subtle'}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: getAvatarColor(mb.name) }}
                  >
                    {getInitials(mb.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{mb.name}</p>
                    <p className="text-text-tertiary text-xs">
                      Pagó {formatCurrency(mb.paid, group.base_currency)} · Corresponde {formatCurrency(mb.share, group.base_currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold font-mono ${mb.balance > 0.01 ? 'text-success' : mb.balance < -0.01 ? 'text-danger' : 'text-text-tertiary'}`}>
                      {mb.balance > 0.01 ? '+' : ''}{formatCurrency(mb.balance, group.base_currency)}
                    </p>
                    <p className={`text-xs font-medium ${mb.balance > 0.01 ? 'text-success' : mb.balance < -0.01 ? 'text-danger' : 'text-text-tertiary'}`}>
                      {mb.balance > 0.01 ? 'le deben' : mb.balance < -0.01 ? 'debe pagar' : 'al día ✓'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {confirmedTotal === 0 && (
              <div className="text-center py-12 text-text-tertiary text-sm">
                <div className="text-4xl mb-3">⚖️</div>
                <p>Confirma entradas para ver el balance del grupo.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Members tab ──────────────────────────────────────────── */}
        {tab === 'members' && (
          <div className="p-6 max-w-lg mx-auto space-y-3">
            <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wider mb-4">
              {members.length} miembro{members.length !== 1 ? 's' : ''} activo{members.length !== 1 ? 's' : ''}
            </p>
            {members.map(m => {
              const name = getMemberName(m);
              const color = getAvatarColor(name);
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-bg-surface border border-border-subtle hover:border-vozpe-200 transition-colors">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{name}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    m.role === 'owner'
                      ? 'bg-vozpe-50 text-vozpe-600 border border-vozpe-200'
                      : 'bg-bg-base text-text-tertiary border border-border-subtle'
                  }`}>
                    {m.role === 'owner' ? '👑 Admin' : 'Miembro'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
