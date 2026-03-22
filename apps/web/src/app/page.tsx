import Link from 'next/link';

export const metadata = {
  title: 'Vozpe — Anota ahora, ordena después',
  description: 'Registra gastos grupales por voz, foto o texto. La sheet viva que tu grupo necesita.',
};

const FEATURES = [
  { emoji: '🎙️', title: 'Captura por voz',             desc: 'Di "Taxi 40 dólares entre 4" y Vozpe lo registra automáticamente. Sin formularios.' },
  { emoji: '📸', title: 'Foto de ticket (OCR)',         desc: 'Toma una foto del recibo y Vozpe extrae los ítems, el total y la categoría.' },
  { emoji: '📋', title: 'Sheet viva y editable',       desc: 'Una tabla hermosa y usable en móvil. Edición inline, filtros y totales en tiempo real.' },
  { emoji: '⚡', title: 'Pendientes inteligentes',     desc: 'Guarda incompleto y resuelve después. El modo caos funcional que todo grupo necesita.' },
  { emoji: '👥', title: 'Colaboración en tiempo real', desc: 'Todos los miembros ven los cambios al instante con Supabase Realtime.' },
  { emoji: '💱', title: 'Múltiples monedas',           desc: 'USD, PEN, EUR, CLP y más. Vozpe convierte y calcula con la moneda base del grupo.' },
  { emoji: '📊', title: 'Liquidación automática',      desc: 'Algoritmo de liquidación mínima. Menos transferencias, más claridad de quién debe qué.' },
  { emoji: '📤', title: 'Export a Excel/CSV',          desc: 'Descarga la sheet completa con un clic. Compatible con Excel, Google Sheets y Numbers.' },
];

const PLANS = [
  {
    name: 'Gratis',
    price: '$0',
    period: '',
    highlight: false,
    features: ['1 grupo', '5 miembros', '30 entradas/mes', 'App móvil incluida'],
    cta: 'Empezar gratis',
    href: '/auth/login',
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/mes',
    highlight: true,
    features: ['Grupos ilimitados', '20 miembros', 'Entradas ilimitadas', 'Voz + Foto con IA', 'Export Excel/CSV'],
    cta: 'Probar Premium',
    href: '/auth/login?plan=premium',
  },
  {
    name: 'Equipo',
    price: '$19.99',
    period: '/mes',
    highlight: false,
    features: ['Todo Premium', 'Miembros ilimitados', 'API + Webhooks', 'Analytics', 'Soporte 24/7'],
    cta: 'Hablar con ventas',
    href: 'mailto:ventas@vozpe.com',
  },
];

const STEPS = [
  { n: '01', title: 'Crea tu grupo',    desc: 'Dale un nombre, tipo y moneda. Invita a tus compañeros.' },
  { n: '02', title: 'Anota cualquier cosa', desc: 'Habla, toma una foto o escribe. Vozpe lo estructura solo.' },
  { n: '03', title: 'Ordena y liquida', desc: 'Confirma entradas, ve el balance y sabe exactamente quién debe qué.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-base">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border-subtle bg-bg-surface shadow-xs sticky top-0 z-50">
        <div className="flex items-center gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-9" />
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Funciones</a>
            <a href="#how"      className="text-text-secondary hover:text-text-primary transition-colors font-medium">Cómo funciona</a>
            <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Precios</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium hidden md:block">
            Iniciar sesión
          </Link>
          <Link href="/auth/login" className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-btn">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-7 relative overflow-hidden">
        {/* Blobs decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-vozpe-500/8 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-green/6 translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold">
          ✦ Captura inteligente de gastos grupales
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary leading-tight max-w-4xl tracking-tight">
          Anota ahora,<br />
          <span className="text-vozpe-500">ordena después.</span>
        </h1>

        <p className="text-text-secondary text-xl max-w-2xl leading-relaxed">
          Registra gastos por <strong className="text-text-primary">voz</strong>, <strong className="text-text-primary">foto</strong> o <strong className="text-text-primary">texto</strong>.
          Vozpe los transforma en una sheet viva, editable y calculada en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-8 py-4 rounded-xl text-base font-bold transition-all hover:scale-105 shadow-fab"
          >
            Empezar gratis — sin tarjeta
          </Link>
          <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition-colors text-base font-medium">
            Ver planes →
          </Link>
        </div>

        <p className="text-text-tertiary text-xs">
          Disponible en iOS y Android · Web incluida
        </p>
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────── */}
      <section id="how" className="px-6 md:px-10 py-20 bg-bg-surface border-y border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-3 tracking-tight">
            Tan simple como hablar
          </h2>
          <p className="text-text-secondary text-center mb-14 text-lg">3 pasos para tener todo bajo control</p>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-2xl font-extrabold mb-5">
                  {s.n}
                </div>
                <h3 className="text-text-primary font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-10 py-20 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-3 tracking-tight">
          Todo lo que tu grupo necesita
        </h2>
        <p className="text-text-secondary text-center mb-14">Sin apps extra. Sin hojas de cálculo. Solo Vozpe.</p>

        <div className="grid md:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="p-5 rounded-2xl bg-bg-surface border border-border-subtle hover:border-vozpe-200 hover:shadow-card transition-all"
            >
              <div className="text-2xl mb-3">{f.emoji}</div>
              <h3 className="text-text-primary font-semibold mb-1.5 text-sm">{f.title}</h3>
              <p className="text-text-tertiary text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-20 bg-bg-surface border-y border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-3 tracking-tight">
            Planes para cada grupo
          </h2>
          <p className="text-text-secondary text-center mb-14">Empieza gratis, escala cuando lo necesites.</p>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border flex flex-col ${
                  plan.highlight
                    ? 'bg-vozpe-500 border-vozpe-600 shadow-fab md:scale-105'
                    : 'bg-bg-base border-border-subtle shadow-card'
                }`}
              >
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-text-primary'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-text-tertiary'}`}>{plan.period}</span>
                  )}
                </div>
                <h3 className={`text-lg font-bold mb-4 ${plan.highlight ? 'text-white' : 'text-text-primary'}`}>
                  {plan.name}
                </h3>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white/90' : 'text-text-secondary'}`}>
                      <span className={plan.highlight ? 'text-white' : 'text-success'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-colors ${
                    plan.highlight
                      ? 'bg-white text-vozpe-600 hover:bg-vozpe-50'
                      : 'bg-vozpe-500 text-white hover:bg-vozpe-600 shadow-btn'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-vozpe-500 hover:text-vozpe-600 text-sm font-medium transition-colors">
              Ver comparativa completa →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
            Tu grupo ya lo necesita.
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Sin registros tediosos. Sin Excel compartido. Sin discusiones sobre quién pagó qué.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-vozpe-500 hover:bg-vozpe-600 text-white px-10 py-4 rounded-xl text-base font-bold transition-all hover:scale-105 shadow-fab"
          >
            Crear cuenta gratis
          </Link>
          <p className="text-text-tertiary text-xs mt-4">Sin tarjeta de crédito · Disponible en iOS, Android y Web</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="px-6 md:px-10 py-8 border-t border-border-subtle bg-bg-surface">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-8 opacity-70" />
          <div className="flex items-center gap-6 text-sm text-text-tertiary">
            <Link href="/pricing"   className="hover:text-text-primary transition-colors">Precios</Link>
            <a href="mailto:soporte@vozpe.com" className="hover:text-text-primary transition-colors">Soporte</a>
            <a href="https://vozpe.com/terminos"   className="hover:text-text-primary transition-colors">Términos</a>
            <a href="https://vozpe.com/privacidad" className="hover:text-text-primary transition-colors">Privacidad</a>
          </div>
          <p className="text-text-tertiary text-xs">
            © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
