import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GroupClient } from './GroupClient';

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

export async function generateMetadata({ params }: PageProps) {
  return { title: `Grupo — Vozpe` };
}

export default async function GroupPage({ params }: PageProps) {
  const { group, entries, members } = await getGroupData(params.id);

  if (!group) notFound();

  const GROUP_EMOJI: Record<string, string> = {
    travel: '✈️', home: '🏠', shopping: '🛒',
    work: '💼', event: '🎉', general: '📋',
  };

  return (
    <div className="flex flex-col h-screen bg-bg-base">
      {/* Header breadcrumb */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border-subtle bg-bg-surface shadow-xs flex-shrink-0">
        <Link
          href="/app"
          className="text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium flex items-center gap-1"
        >
          ← <span className="hidden sm:inline">Grupos</span>
        </Link>
        <span className="text-border-default">/</span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">
            {(group as any).cover_emoji ?? GROUP_EMOJI[(group as any).type] ?? '📋'}
          </span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-text-primary truncate">{(group as any).name}</h1>
            <p className="text-xs text-text-tertiary">
              {members.length} miembro{members.length !== 1 ? 's' : ''} · {(group as any).base_currency}
            </p>
          </div>
        </div>
      </header>

      {/* Client interactive body */}
      <div className="flex-1 overflow-hidden">
        <GroupClient
          group={{
            id: (group as any).id,
            name: (group as any).name,
            base_currency: (group as any).base_currency,
            type: (group as any).type,
          }}
          initialEntries={entries as any[]}
          members={members as any[]}
        />
      </div>
    </div>
  );
}
