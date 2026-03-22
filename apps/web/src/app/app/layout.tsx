import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function getUser() {
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
  return user;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/auth/login');

  const initials = user.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen flex bg-bg-base">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-bg-surface border-r border-border-subtle flex flex-col shadow-sm">
        {/* Logo */}
        <div className="flex items-center px-5 py-4 border-b border-border-subtle">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-7" />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <Link
            href="/app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all text-sm font-medium"
          >
            <span className="text-base">🏠</span> Mis grupos
          </Link>
          <Link
            href="/app/group/create"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all text-sm font-medium"
          >
            <span className="text-base">➕</span> Nuevo grupo
          </Link>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle">
            <div className="w-7 h-7 rounded-full bg-vozpe-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="truncate flex-1 text-text-secondary text-xs">{user.email}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
