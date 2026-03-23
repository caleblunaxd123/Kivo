import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Sidebar } from './_components/Sidebar';

// Paleta de colores — misma que T.generateMemberColor del móvil
const MEMBER_COLORS = [
  '#1F6FE5', '#2DBE60', '#7C3AED', '#E5761F',
  '#DB2777', '#0891B2', '#D97706', '#059669',
];

function generateColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + (hash << 5) - hash;
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

function generateInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

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
  if (!user) return null;

  // Fetch profile for display name + plan
  const { data: profile } = await supabase
    .from('users')
    .select('display_name, subscription_plan')
    .eq('id', user.id)
    .single();

  return { user, profile };
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const result = await getUser();
  if (!result) redirect('/auth/login');

  const { user, profile } = result;
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Usuario';
  const plan = (profile?.subscription_plan as 'free' | 'premium' | 'team') ?? 'free';

  return (
    <div className="min-h-screen flex bg-bg-base">
      <Sidebar
        userEmail={user.email ?? ''}
        userName={displayName}
        userInitials={generateInitials(displayName)}
        userColor={generateColor(displayName)}
        plan={plan}
      />

      {/* Main content — add left padding on mobile for hamburger button */}
      <main className="flex-1 overflow-auto md:ml-0">
        {children}
      </main>
    </div>
  );
}
