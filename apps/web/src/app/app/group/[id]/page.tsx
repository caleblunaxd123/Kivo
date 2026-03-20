import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@kivo/shared';
import type { Entry, GroupMember } from '@kivo/shared';

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

export default async function GroupPage({ params }: PageProps) {
  const { group, entries, members } = await getGroupData(params.id);

  if (!group) notFound();

  const confirmedTotal = entries
    .filter((e: any) => e.status === 'confirmed')
    .reduce((sum: number, e: any) => sum + (e.amount_in_base ?? e.amount), 0);

  const pendingCount = entries.filter((e: any) => e.status === 'pending_review').length;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-[#1E1E2E] bg-[#111118]">
        <Link href="/app" className="text-[#9090B8] hover:text-[#F0F0FF] transition-colors">
          ← Grupos
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#F0F0FF]">{group.name}</h1>
          <p className="text-xs text-[#5A5A80]">
            {members.length} miembro{members.length !== 1 ? 's' : ''} · {group.base_currency}
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-orange-400 text-xs font-medium">{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
          </div>
        )}
        <div className="text-right">
          <p className="text-xs text-[#5A5A80]">Total confirmado</p>
          <p className="text-lg font-bold text-[#F0F0FF] font-mono">
            {formatCurrency(confirmedTotal, group.base_currency)}
          </p>
        </div>
      </header>

      {/* Sheet table */}
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="text-5xl">📋</div>
            <p className="text-[#F0F0FF] font-semibold">La hoja está vacía</p>
            <p className="text-[#9090B8] text-sm">Agrega entradas desde la app móvil.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#111118] border-b border-[#2A2A45]">
              <tr>
                <th className="px-4 py-3 text-left text-[#5A5A80] font-medium text-xs w-10">#</th>
                <th className="px-4 py-3 text-left text-[#5A5A80] font-medium text-xs">Descripción</th>
                <th className="px-4 py-3 text-left text-[#5A5A80] font-medium text-xs">Categoría</th>
                <th className="px-4 py-3 text-left text-[#5A5A80] font-medium text-xs">Pagó</th>
                <th className="px-4 py-3 text-right text-[#5A5A80] font-medium text-xs">Monto</th>
                <th className="px-4 py-3 text-left text-[#5A5A80] font-medium text-xs">Fecha</th>
                <th className="px-4 py-3 text-center text-[#5A5A80] font-medium text-xs">Estado</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: any, i: number) => {
                const isPending = entry.status === 'pending_review';
                const paidBy = members.find((m: any) => m.user_id === entry.paid_by);

                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-[#1E1E2E] hover:bg-[#111118] transition-colors ${isPending ? 'bg-orange-500/5' : ''}`}
                  >
                    <td className="px-4 py-3 text-[#5A5A80] text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <div className="w-1 h-4 rounded-full bg-orange-500 flex-shrink-0" />
                        )}
                        <span className="text-[#F0F0FF]">{entry.description || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9090B8]">{entry.category ?? '—'}</td>
                    <td className="px-4 py-3 text-[#9090B8]">
                      {paidBy?.display_name ?? paidBy?.user?.display_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-[#F0F0FF]">
                      {formatCurrency(entry.amount, entry.currency)}
                    </td>
                    <td className="px-4 py-3 text-[#9090B8] text-xs">
                      {formatDate(entry.entry_date)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isPending
                            ? 'bg-orange-500/15 text-orange-400'
                            : 'bg-green-500/15 text-green-400'
                        }`}
                      >
                        {isPending ? '⏳ Pendiente' : '✓ Confirmada'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
