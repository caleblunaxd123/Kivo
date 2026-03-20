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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#111118] border-r border-[#1E1E2E] flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[#1E1E2E]">
          <div className="w-7 h-7 rounded-lg bg-kivo-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <span className="text-[#F0F0FF] font-semibold">Kivo</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9090B8] hover:text-[#F0F0FF] hover:bg-[#1A1A26] transition-colors text-sm"
          >
            <span>🏠</span> Mis grupos
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9090B8] hover:text-[#F0F0FF] hover:bg-[#1A1A26] transition-colors text-sm"
          >
            <span>📋</span> Actividad
          </Link>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[#1E1E2E]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9090B8] text-sm">
            <div className="w-7 h-7 rounded-full bg-kivo-500 flex items-center justify-center text-white text-xs font-bold">
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="truncate flex-1">{user.email}</span>
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
