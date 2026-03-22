import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatCurrency, formatRelativeTime } from '@vozpe/shared';
import type { Group } from '@vozpe/shared';

const GROUP_EMOJI: Record<string, string> = {
  travel: '✈️', home: '🏠', shopping: '🛒',
  work: '💼', event: '🎉', general: '📋',
  materials: '🔧', birthday: '🎂',
};

async function getGroups(): Promise<Group[]> {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('group_members')
    .select('group:groups(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (data?.map((d: any) => d.group).filter(Boolean) ?? []) as Group[];
}

export default async function AppHomePage() {
  const groups = await getGroups();

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Mis grupos</h1>
          <p className="text-text-tertiary text-sm mt-0.5">
            {groups.length} grupo{groups.length !== 1 ? 's' : ''} activo{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/app/group/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 text-white text-sm font-semibold transition-colors shadow-btn"
        >
          + Nuevo grupo
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Sin grupos todavía</h2>
          <p className="text-text-secondary mb-6 text-sm">Crea tu primer grupo para empezar a rastrear gastos.</p>
          <Link
            href="/app/group/create"
            className="px-6 py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 text-white font-semibold transition-colors shadow-btn"
          >
            Crear primer grupo
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/app/group/${group.id}`}
              className="p-5 rounded-2xl bg-bg-surface border border-border-subtle hover:border-vozpe-500 hover:shadow-card transition-all block group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-default flex items-center justify-center text-xl">
                    {group.coverEmoji ?? GROUP_EMOJI[group.type] ?? '📋'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary group-hover:text-vozpe-500 transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-text-tertiary text-xs mt-0.5">
                      {formatRelativeTime(group.updatedAt)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-text-tertiary bg-bg-elevated border border-border-subtle rounded-full px-2.5 py-1">
                  {group.baseCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-text-tertiary text-xs">Total registrado</span>
                <span className="font-mono font-bold text-text-primary text-sm">
                  {formatCurrency(group.totalAmount ?? 0, group.baseCurrency)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {(group.pendingCount ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/10 border border-warning/20 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    {group.pendingCount} pendiente{group.pendingCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-xs text-success font-medium">✓ Al día</span>
                )}
                <span className="text-vozpe-500 text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                  Ver sheet →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
