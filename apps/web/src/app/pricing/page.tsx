import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    description: 'Perfecto para probar Vozpe con tu grupo pequeño.',
    featured: false,
    ctaLabel: 'Empezar gratis',
    ctaHref: '/auth/login',
    ctaStyle: 'bg-bg-elevated border border-border-default text-text-secondary hover:border-vozpe-500 hover:text-vozpe-600',
    features: [
      { ok: true,  label: '1 grupo activo'            },
      { ok: true,  label: 'Hasta 5 miembros'          },
      { ok: true,  label: '30 entradas por mes'       },
      { ok: true,  label: 'Captura por texto'         },
      { ok: true,  label: 'App móvil (iOS + Android)' },
      { ok: true,  label: 'Balance del grupo'         },
      { ok: false, label: 'Captura por voz con IA'    },
      { ok: false, label: 'Captura por foto (OCR)'    },
      { ok: false, label: 'Grupos ilimitados'         },
      { ok: false, label: 'Export a Excel/CSV'        },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: 'por mes',
    description: 'Para grupos que registran todo sin fricción y quieren IA.',
    featured: true,
    ctaLabel: 'Empezar Premium',
    ctaHref: '/auth/login?plan=premium',
    ctaStyle: 'bg-white text-vozpe-600 hover:bg-vozpe-50 font-bold shadow-sm',
    features: [
      { ok: true, label: 'Grupos ilimitados'           },
      { ok: true, label: 'Hasta 20 miembros por grupo' },
      { ok: true, label: 'Entradas ilimitadas'         },
      { ok: true, label: 'Captura por voz con IA'      },
      { ok: true, label: 'Captura por foto (OCR)'      },
      { ok: true, label: 'App móvil (iOS + Android)'   },
      { ok: true, label: 'Realtime entre miembros'     },
      { ok: true, label: 'Export a Excel/CSV'          },
      { ok: true, label: 'Balance y liquidación'       },
      { ok: false, label: 'API access'                 },
    ],
  },
  {
    id: 'team',
    name: 'Equipo',
    price: '$19.99',
    period: 'por mes',
    description: 'Para equipos de trabajo, proyectos y empresas pequeñas.',
    featured: false,
    ctaLabel: 'Hablar con ventas',
    ctaHref: 'mailto:ventas@vozpe.com',
    ctaStyle: 'bg-vozpe-500 text-white hover:bg-vozpe-600 shadow-btn',
    features: [
      { ok: true, label: 'Todo lo de Premium'          },
      { ok: true, label: 'Miembros ilimitados'         },
      { ok: true, label: 'Dashboard de analytics'      },
      { ok: true, label: 'API access (REST)'           },
      { ok: true, label: 'Webhooks'                    },
      { ok: true, label: 'SSO / SAML (próximamente)'  },
      { ok: true, label: 'SLA de disponibilidad'       },
      { ok: true, label: 'Soporte prioritario 24/7'    },
      { ok: true, label: 'Facturación por empresa'     },
      { ok: true, label: 'Onboarding personalizado'    },
    ],
  },
];

const FAQS = [
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Puedes hacer upgrade o downgrade cuando quieras desde tu perfil. Los cambios se aplican de inmediato.',
  },
  {
    q: '¿Qué pasa si supero el límite de entradas en el plan Gratis?',
    a: 'Puedes ver las entradas existentes pero no agregar nuevas hasta el siguiente mes o hasta que hagas upgrade.',
  },
  {
    q: '¿Los datos están seguros?',
    a: 'Sí. Usamos Supabase (PostgreSQL) con cifrado en tránsito (TLS) y en reposo. Tus datos nunca se comparten con terceros.',
  },
  {
    q: '¿Hay contrato de permanencia?',
    a: 'No. Los planes son mensuales sin compromiso. Cancela cuando quieras desde Ajustes.',
  },
  {
    q: '¿La app móvil está incluida?',
    a: 'Sí. La app de iOS y Android está incluida en todos los planes, incluyendo el Gratis.',
  },
  {
    q: '¿Cómo funciona la captura por voz?',
    a: 'Di algo como "Taxi 40 soles entre Carlos y Ana" y Vozpe extrae descripción, monto, moneda y participantes automáticamente con IA.',
  },
];

export const metadata = {
  title: 'Planes y Precios — Vozpe',
  description: 'Elige el plan que mejor se adapta a tu grupo. Gratis para siempre, o premium desde $9.99/mes.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-bg-base">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md shadow-xs sticky top-0 z-50">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors hidden sm:block">
            Iniciar sesión
          </Link>
          <Link href="/auth/login" className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-btn">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold mb-6 shadow-xs">
            💳 Planes y precios
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Anota sin límites
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Empieza gratis y escala cuando tu grupo lo necesite.
            <br />
            <span className="text-text-tertiary text-sm">Sin tarjeta de crédito para el plan Gratis.</span>
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5 items-start mb-20">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-7 flex flex-col ${
                plan.featured
                  ? 'bg-gradient-to-b from-vozpe-500 to-vozpe-600 border-vozpe-700 md:scale-105 shadow-fab'
                  : 'bg-bg-surface border-border-subtle shadow-card hover:border-vozpe-200 hover:shadow-card transition-all'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-white text-vozpe-600 text-xs font-bold px-5 py-1.5 rounded-full shadow-card border border-vozpe-200">
                    ✦ Más popular
                  </span>
                </div>
              )}

              <div className="mb-5 mt-1">
                <h2 className={`text-sm font-bold mb-1 uppercase tracking-wider ${plan.featured ? 'text-white/70' : 'text-text-tertiary'}`}>
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className={`text-4xl font-extrabold tracking-tight ${plan.featured ? 'text-white' : 'text-text-primary'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.featured ? 'text-white/60' : 'text-text-tertiary'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.featured ? 'text-white/80' : 'text-text-secondary'}`}>
                  {plan.description}
                </p>
              </div>

              <Link
                href={plan.ctaHref}
                className={`block w-full text-center py-3 rounded-xl text-sm transition-all mb-7 ${plan.ctaStyle}`}
              >
                {plan.ctaLabel}
              </Link>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <span className={`text-sm flex-shrink-0 w-4 text-center ${
                      f.ok
                        ? (plan.featured ? 'text-white' : 'text-success')
                        : (plan.featured ? 'text-white/25' : 'text-border-default')
                    }`}>
                      {f.ok ? '✓' : '—'}
                    </span>
                    <span className={`text-sm ${
                      f.ok
                        ? (plan.featured ? 'text-white' : 'text-text-primary')
                        : (plan.featured ? 'text-white/35 line-through' : 'text-text-tertiary line-through')
                    }`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { emoji: '🔒', title: 'Datos seguros', desc: 'Cifrado TLS + reposo' },
            { emoji: '🚫', title: 'Sin permanencia', desc: 'Cancela cuando quieras' },
            { emoji: '📱', title: 'Multi-plataforma', desc: 'iOS, Android y Web' },
            { emoji: '⚡', title: 'Tiempo real', desc: 'Sync instantáneo' },
          ].map(b => (
            <div key={b.title} className="p-4 rounded-2xl bg-bg-surface border border-border-subtle text-center hover:border-vozpe-200 transition-colors">
              <div className="text-2xl mb-2">{b.emoji}</div>
              <p className="text-text-primary text-xs font-semibold">{b.title}</p>
              <p className="text-text-tertiary text-xs">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10 tracking-tight">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQS.map(faq => (
              <div key={faq.q} className="p-5 rounded-2xl bg-bg-surface border border-border-subtle hover:border-vozpe-200 transition-colors">
                <h3 className="font-semibold text-text-primary mb-2 text-sm">{faq.q}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center p-10 rounded-3xl bg-gradient-to-br from-vozpe-500 to-vozpe-600 shadow-fab">
          <h2 className="text-2xl font-bold text-white mb-3">¿Listo para empezar?</h2>
          <p className="text-white/80 text-sm mb-6">Gratis para siempre, sin tarjeta de crédito.</p>
          <Link
            href="/auth/login"
            className="inline-block bg-white text-vozpe-600 hover:bg-vozpe-50 px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-card"
          >
            Crear cuenta gratis →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border-subtle text-center text-text-tertiary text-sm">
        <div className="flex items-center justify-center gap-6 mb-2">
          <Link href="/" className="hover:text-text-primary transition-colors">Inicio</Link>
          <a href="mailto:soporte@vozpe.com" className="hover:text-text-primary transition-colors">Soporte</a>
          <Link href="/terminos" className="hover:text-text-primary transition-colors">Términos</Link>
          <Link href="/privacidad" className="hover:text-text-primary transition-colors">Privacidad</Link>
        </div>
        © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
      </footer>
    </main>
  );
}
