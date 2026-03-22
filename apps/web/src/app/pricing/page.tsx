import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    description: 'Perfecto para probar Vozpe con tu grupo.',
    color: 'bg-bg-surface border-border-default',
    ctaColor: 'bg-bg-elevated border border-border-default text-text-secondary hover:border-vozpe-500 hover:text-vozpe-600',
    ctaLabel: 'Empezar gratis',
    ctaHref: '/auth/login',
    featured: false,
    features: [
      { ok: true,  label: '1 grupo activo'                },
      { ok: true,  label: 'Hasta 5 miembros'              },
      { ok: true,  label: '30 entradas por mes'           },
      { ok: true,  label: 'Captura por texto'             },
      { ok: true,  label: 'App móvil (iOS + Android)'     },
      { ok: false, label: 'Captura por voz con IA'        },
      { ok: false, label: 'Captura por foto (OCR)'        },
      { ok: false, label: 'Grupos ilimitados'             },
      { ok: false, label: 'Export a Excel/CSV'            },
      { ok: false, label: 'Soporte prioritario'           },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: 'por mes',
    description: 'Para grupos que registran todo sin fricción.',
    color: 'bg-vozpe-500 border-vozpe-600',
    ctaColor: 'bg-white text-vozpe-600 hover:bg-vozpe-50 font-bold',
    ctaLabel: 'Empezar Premium',
    ctaHref: '/auth/login?plan=premium',
    featured: true,
    features: [
      { ok: true,  label: 'Grupos ilimitados'            },
      { ok: true,  label: 'Hasta 20 miembros por grupo'  },
      { ok: true,  label: 'Entradas ilimitadas'          },
      { ok: true,  label: 'Captura por voz con IA'       },
      { ok: true,  label: 'Captura por foto (OCR)'       },
      { ok: true,  label: 'App móvil (iOS + Android)'    },
      { ok: true,  label: 'Realtime entre miembros'      },
      { ok: true,  label: 'Export a Excel/CSV'           },
      { ok: false, label: 'API access'                   },
      { ok: false, label: 'Soporte prioritario'          },
    ],
  },
  {
    id: 'team',
    name: 'Equipo',
    price: '$19.99',
    period: 'por mes',
    description: 'Para equipos de trabajo y empresas pequeñas.',
    color: 'bg-bg-surface border-border-default',
    ctaColor: 'bg-vozpe-500 text-white hover:bg-vozpe-600 font-bold shadow-btn',
    ctaLabel: 'Hablar con ventas',
    ctaHref: 'mailto:ventas@vozpe.com',
    featured: false,
    features: [
      { ok: true, label: 'Todo lo de Premium'            },
      { ok: true, label: 'Miembros ilimitados'           },
      { ok: true, label: 'Dashboard de analytics'        },
      { ok: true, label: 'API access (REST)'             },
      { ok: true, label: 'Webhooks'                      },
      { ok: true, label: 'SSO / SAML (próximamente)'     },
      { ok: true, label: 'SLA de disponibilidad'         },
      { ok: true, label: 'Soporte prioritario 24/7'      },
      { ok: true, label: 'Facturación por empresa'       },
      { ok: true, label: 'Onboarding personalizado'      },
    ],
  },
];

export const metadata = {
  title: 'Planes — Vozpe',
  description: 'Elige el plan que mejor se adapta a tu grupo o equipo.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-bg-base">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-surface shadow-xs">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-7" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold mb-6">
            💳 Planes y precios
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Anota sin límites
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Empieza gratis y escala cuando tu grupo lo necesite.
            Sin tarjeta de crédito para el plan Gratis.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-8 ${plan.color} ${plan.featured ? 'md:scale-105 shadow-fab' : 'shadow-card'}`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-vozpe-600 text-xs font-bold px-4 py-1.5 rounded-full shadow-card border border-vozpe-200">
                    ✦ Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className={`text-lg font-bold mb-1 ${plan.featured ? 'text-white' : 'text-text-primary'}`}>
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className={`text-4xl font-extrabold tracking-tight ${plan.featured ? 'text-white' : 'text-text-primary'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.featured ? 'text-white/70' : 'text-text-tertiary'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.featured ? 'text-white/80' : 'text-text-secondary'}`}>
                  {plan.description}
                </p>
              </div>

              <Link
                href={plan.ctaHref}
                className={`block w-full text-center py-3 rounded-xl text-sm transition-all mb-8 ${plan.ctaColor}`}
              >
                {plan.ctaLabel}
              </Link>

              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f.label} className="flex items-center gap-3">
                    <span className={`text-sm flex-shrink-0 ${f.ok ? (plan.featured ? 'text-white' : 'text-success') : (plan.featured ? 'text-white/30' : 'text-text-tertiary')}`}>
                      {f.ok ? '✓' : '—'}
                    </span>
                    <span className={`text-sm ${f.ok ? (plan.featured ? 'text-white' : 'text-text-primary') : (plan.featured ? 'text-white/40' : 'text-text-tertiary line-through')}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-6">
            {[
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
                a: 'No. Los planes son mensuales sin compromiso de permanencia. Cancela cuando quieras.',
              },
              {
                q: '¿La app móvil está incluida?',
                a: 'Sí. La app de iOS y Android está incluida en todos los planes, incluyendo el Gratis.',
              },
            ].map(faq => (
              <div key={faq.q} className="p-6 rounded-2xl bg-bg-surface border border-border-subtle">
                <h3 className="font-semibold text-text-primary mb-2">{faq.q}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border-subtle text-center text-text-tertiary text-sm">
        <div className="flex items-center justify-center gap-6 mb-2">
          <Link href="/" className="hover:text-text-primary transition-colors">Inicio</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Precios</Link>
          <a href="mailto:soporte@vozpe.com" className="hover:text-text-primary transition-colors">Soporte</a>
        </div>
        © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
      </footer>
    </main>
  );
}
