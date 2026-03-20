import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatCurrency, formatRelativeTime } from '@kivo/shared';
import type { Group } from '@kivo/shared';

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F0FF]">Mis grupos</h1>
          <p className="text-[#9090B8] text-sm mt-1">
            {groups.length} grupo{groups.length !== 1 ? 's' : ''} activo{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/app/groups/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kivo-500 hover:bg-kivo-600 text-white text-sm font-medium transition-colors"
        >
          + Nuevo grupo
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-[#F0F0FF] mb-2">Sin grupos todavía</h2>
          <p className="text-[#9090B8] mb-6">Crea tu primer grupo para empezar a rastrear gastos.</p>
          <Link
            href="/app/groups/create"
            className="px-6 py-3 rounded-xl bg-kivo-500 hover:bg-kivo-600 text-white font-medium transition-colors"
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
              className="p-5 rounded-2xl bg-[#111118] border border-[#1E1E2E] hover:border-[#2A2A45] transition-all hover:scale-[1.01] block"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#F0F0FF]">{group.name}</h3>
                  <p className="text-[#5A5A80] text-xs mt-0.5">
                    {formatRelativeTime(group.updatedAt)}
                  </p>
                </div>
                <div className="text-2xl">
                  {group.type === 'travel' ? '✈️' :
                   group.type === 'home' ? '🏠' :
                   group.type === 'shopping' ? '🛒' :
                   group.type === 'work' ? '💼' : '📋'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5A5A80]">{group.baseCurrency}</span>
                <span className="text-[#818CF8] text-xs font-medium">Ver sheet →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
