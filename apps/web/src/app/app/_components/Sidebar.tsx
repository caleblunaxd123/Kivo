'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userEmail: string;
  userName: string;
  userInitials: string;
  userColor: string;
  plan: 'free' | 'premium' | 'team';
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free:    { label: 'Gratis',  cls: 'bg-border-subtle text-text-tertiary' },
  premium: { label: 'Premium', cls: 'bg-vozpe-50 text-vozpe-600 border border-vozpe-200' },
  team:    { label: 'Equipo',  cls: 'bg-brand-soft text-brand-deep border border-brand-green/30' },
};

export function Sidebar({ userEmail, userName, userInitials, userColor, plan }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/app',                  emoji: '🏠', label: 'Mis grupos'   },
    { href: '/app/group/create',     emoji: '➕', label: 'Nuevo grupo'  },
    { href: '/app/settings',         emoji: '⚙️', label: 'Ajustes'     },
    { href: '/app/billing',          emoji: '💳', label: 'Plan'         },
  ];

  const isActive = (href: string) =>
    href === '/app' ? pathname === '/app' : pathname.startsWith(href);

  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  return (
    <aside className="w-60 flex-shrink-0 bg-bg-surface border-r border-border-subtle flex flex-col shadow-xs">
      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-border-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-vozpe.png" alt="Vozpe" className="h-9" />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? 'bg-vozpe-50 text-vozpe-600 font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            <span className="text-base w-5 text-center">{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border-subtle space-y-2">
        {/* Plan badge */}
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-text-tertiary">Plan</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: userColor }}
          >
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-xs font-semibold truncate">{userName}</p>
            <p className="text-text-tertiary text-xs truncate">{userEmail}</p>
          </div>
        </div>

        {/* Sign out */}
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-tertiary hover:text-danger hover:bg-danger/5 transition-all font-medium"
          >
            <span className="text-base">↩</span>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
