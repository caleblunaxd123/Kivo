'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  userEmail: string;
  userName: string;
  userInitials: string;
  userColor: string;
  plan: 'free' | 'premium' | 'team';
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free:    { label: 'Gratis',  cls: 'bg-bg-base text-text-tertiary border border-border-subtle' },
  premium: { label: 'Premium', cls: 'bg-vozpe-50 text-vozpe-600 border border-vozpe-200' },
  team:    { label: 'Equipo',  cls: 'bg-brand-soft text-brand-deep border border-brand-green/30' },
};

const NAV_ITEMS = [
  { href: '/app',              icon: '🏠', label: 'Mis grupos'  },
  { href: '/app/group/create', icon: '➕', label: 'Nuevo grupo' },
  { href: '/app/settings',     icon: '⚙️', label: 'Ajustes'    },
  { href: '/app/billing',      icon: '💳', label: 'Plan'        },
];

function SidebarContent({
  userEmail, userName, userInitials, userColor, plan, pathname, onClose,
}: SidebarProps & { pathname: string; onClose?: () => void }) {
  const isActive = (href: string) =>
    href === '/app' ? pathname === '/app' : pathname.startsWith(href);

  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  return (
    <div className="h-full flex flex-col bg-bg-surface border-r border-border-subtle">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-vozpe.png" alt="Vozpe" className="h-8" />
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors md:hidden"
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? 'bg-vozpe-500 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border-subtle space-y-2">
        {/* Plan badge */}
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-text-tertiary">Plan actual</span>
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
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col shadow-xs">
        <SidebarContent {...props} pathname={pathname} />
      </aside>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-bg-surface border border-border-default shadow-card text-text-primary hover:bg-bg-elevated transition-colors"
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile: backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent {...props} pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
