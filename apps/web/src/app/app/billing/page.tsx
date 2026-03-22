import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function getUserPlan() {
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

  const { data } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .single();

  return data;
}

const PLAN_INFO: Record<string, { name: string; color: string; description: string; price: string }> = {
  free: {
    name: 'Gratis',
    color: 'text-text-secondary',
    description: '1 grupo · 5 miembros · 30 entradas/mes',
    price: '$0',
  },
  premium: {
    name: 'Premium',
    color: 'text-vozpe-600',
    description: 'Grupos ilimitados · IA · Export',
    price: '$9.99/mes',
  },
  team: {
    name: 'Equipo',
    color: 'text-brand-deep',
    description: 'Todo Premium · Analytics · API · Soporte 24/7',
    price: '$19.99/mes',
  },
};

export default async function BillingPage() {
  const profile = await getUserPlan();
  const plan = (profile?.subscription_plan as string) ?? 'free';
  const info = PLAN_INFO[plan] ?? PLAN_INFO.free;
  const expiresAt = profile?.subscription_expires_at;

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Plan y facturación</h1>
        <p className="text-text-tertiary text-sm mt-1">Gestiona tu suscripción</p>
      </div>

      {/* Plan actual */}
      <div className="bg-bg-surface rounded-2xl border border-border-subtle p-6 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Plan actual</h2>
          <span className={`text-sm font-bold ${info.color}`}>{info.name}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-border-subtle">
          <span className="text-text-secondary text-sm">Incluye</span>
          <span className="text-text-primary text-sm font-medium text-right max-w-xs">{info.description}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-border-subtle">
          <span className="text-text-secondary text-sm">Precio</span>
          <span className="text-text-primary text-sm font-bold font-mono">{info.price}</span>
        </div>

        {expiresAt && (
          <div className="flex items-center justify-between py-3 border-t border-border-subtle">
            <span className="text-text-secondary text-sm">
              {plan === 'free' ? 'Válido hasta' : 'Próxima renovación'}
            </span>
            <span className="text-text-tertiary text-sm font-mono">
              {new Date(expiresAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* CTA según plan */}
      {plan === 'free' && (
        <div className="bg-vozpe-500 rounded-2xl p-6 text-white shadow-fab mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg mb-1">Pasa a Premium</h3>
              <p className="text-white/80 text-sm">Voz, foto, grupos ilimitados y más.</p>
            </div>
            <span className="text-2xl font-extrabold">$9.99</span>
          </div>
          <Link
            href="/pricing"
            className="block w-full text-center py-3 rounded-xl bg-white text-vozpe-600 font-bold text-sm hover:bg-vozpe-50 transition-colors mt-4"
          >
            Ver todos los planes →
          </Link>
        </div>
      )}

      {plan === 'premium' && (
        <div className="bg-bg-surface rounded-2xl border border-border-subtle p-6 shadow-xs mb-6">
          <h3 className="font-semibold text-text-primary mb-1">¿Necesitas más?</h3>
          <p className="text-text-secondary text-sm mb-4">El plan Equipo incluye API, analytics y soporte prioritario.</p>
          <a
            href="mailto:ventas@vozpe.com"
            className="block w-full text-center py-3 rounded-xl bg-vozpe-500 text-white font-semibold text-sm hover:bg-vozpe-600 transition-colors shadow-btn"
          >
            Hablar con ventas
          </a>
        </div>
      )}

      {/* Notas */}
      <div className="bg-bg-elevated rounded-xl border border-border-subtle p-4">
        <p className="text-text-tertiary text-xs leading-relaxed">
          Para cambios de plan, cancelaciones o consultas de facturación escríbenos a{' '}
          <a href="mailto:soporte@vozpe.com" className="text-vozpe-500 hover:underline">soporte@vozpe.com</a>.
          Los pagos se procesan de forma segura. Sin compromisos de permanencia.
        </p>
      </div>
    </div>
  );
}
