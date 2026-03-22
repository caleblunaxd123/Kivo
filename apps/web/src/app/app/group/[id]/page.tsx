import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@vozpe/shared';
import type { Entry, GroupMember } from '@vozpe/shared';

async function getGroupData(groupId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );

  const [{ data: group }, { data: entries }, { data: members }] = await Promise.all([
    supabase.from('groups').select('*').eq('id', groupId).single(),
    supabase
      .from('entries')
      .select('*')
      .eq('group_id', groupId)
      .neq('status', 'archived')
      .order('entry_date', { ascending: false }),
    supabase
      .from('group_members')
      .select('*, user:users(id, display_name, avatar_url)')
      .eq('group_id', groupId)
      .eq('status', 'active'),
  ]);

  return { group, entries: entries ?? [], members: members ?? [] };
}

interface PageProps {
  params: { id: string };
}

const CATEGORY_EMOJI: Record<string, string> = {
  transport: '🚗', food: '🍽', accommodation: '🏨',
  shopping: '🛒', entertainment: '🎉', travel: '✈️',
  health: '💊', utilities: '⚡', other: '📦',
};

export default async function GroupPage({ params }: PageProps) {
  const { group, entries, members } = await getGroupData(params.id);

  if (!group) notFound();

  const confirmedTotal = entries
    .filter((e: any) => e.status === 'confirmed')
    .reduce((sum: number, e: any) => sum + (e.amount_in_base ?? e.amount), 0);

  const pendingCount = entries.filter((e: any) => e.status === 'pending_review').length;

  return (
    <div className="flex flex-col h-screen bg-bg-base">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border-subtle bg-bg-surface shadow-sm">
        <Link
          href="/app"
          className="text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium"
        >
          ← Grupos
        </Link>
        <span className="text-border-default">/</span>
        <div className="flex-1">
          <h1 className="text-base font-bold text-text-primary">{group.name}</h1>
          <p className="text-xs text-text-tertiary">
            {members.length} miembro{members.length !== 1 ? 's' : ''} · {group.base_currency}
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/25">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            <span className="text-warning text-xs font-semibold">{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="text-right">
          <p className="text-xs text-text-tertiary">Total confirmado</p>
          <p className="text-lg font-bold text-text-primary font-mono">
            {formatCurrency(confirmedTotal, group.base_currency)}
          </p>
        </div>
      </header>

      {/* Sheet table */}
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="text-5xl">📋</div>
            <p className="text-text-primary font-semibold">La hoja está vacía</p>
            <p className="text-text-tertiary text-sm">Agrega entradas desde la app móvil.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-surface border-b border-border-default">
              <tr>
                <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs w-10">#</th>
                <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs">Descripción</th>
                <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs">Categoría</th>
                <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs">Pagó</th>
                <th className="px-4 py-3 text-right text-text-tertiary font-semibold text-xs">Monto</th>
                <th className="px-4 py-3 text-left text-text-tertiary font-semibold text-xs">Fecha</th>
                <th className="px-4 py-3 text-center text-text-tertiary font-semibold text-xs">Estado</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: any, i: number) => {
                const isPending = entry.status === 'pending_review';
                const paidBy = members.find((m: any) =>
                  (m.user_id && m.user_id === entry.paid_by) || m.id === entry.paid_by
                );
                const catEmoji = CATEGORY_EMOJI[entry.category] ?? '📦';

                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-border-subtle transition-colors ${
                      isPending
                        ? 'bg-warning/5 hover:bg-warning/10'
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
                          {entry.description || '—'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-text-secondary text-xs">
                        {catEmoji} {entry.category ?? '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-text-secondary text-sm">
                      {paidBy?.user?.display_name ?? paidBy?.display_name ?? '—'}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                      {formatCurrency(entry.amount, entry.currency)}
                    </td>

                    <td className="px-4 py-3 text-text-tertiary text-xs font-mono">
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
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals */}
            <tfoot className="sticky bottom-0 bg-bg-elevated border-t-2 border-border-default">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-text-tertiary text-xs font-medium">
                  {entries.length} fila{entries.length !== 1 ? 's' : ''}
                  {pendingCount > 0 && ` · ${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-vozpe-500 text-base">
                  {formatCurrency(confirmedTotal, group.base_currency)}
                </td>
                <td colSpan={2} className="px-4 py-3 text-text-tertiary text-xs">
                  confirmado
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
