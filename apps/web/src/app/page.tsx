import Link from 'next/link';

export const metadata = {
  title: 'Vozpe — Anota ahora, ordena después',
  description: 'Registra gastos grupales por voz, foto o texto. La sheet viva que tu grupo necesita. Disponible en iOS, Android y Web.',
  openGraph: {
    title: 'Vozpe — Anota ahora, ordena después',
    description: 'Registra gastos grupales por voz, foto o texto. Sin formularios. Sin Excel.',
    siteName: 'Vozpe',
    locale: 'es_PE',
    type: 'website',
  },
};

const FEATURES = [
  {
    emoji: '🎙️',
    title: 'Captura por voz',
    desc: 'Di "Taxi 40 dólares entre 4" y Vozpe lo registra automáticamente. Sin formularios, sin fricción.',
    color: 'from-violet-500/10 to-indigo-500/10',
    border: 'hover:border-violet-300',
  },
  {
    emoji: '📸',
    title: 'Foto de ticket',
    desc: 'Toma una foto del recibo. Vozpe extrae ítems, total y categoría con OCR inteligente.',
    color: 'from-blue-500/10 to-indigo-500/10',
    border: 'hover:border-blue-300',
  },
  {
    emoji: '📋',
    title: 'Sheet viva',
    desc: 'Una tabla hermosa y usable en móvil. Edición inline, filtros y totales en tiempo real.',
    color: 'from-indigo-500/10 to-purple-500/10',
    border: 'hover:border-indigo-300',
  },
  {
    emoji: '⚡',
    title: 'Modo caos funcional',
    desc: 'Guarda incompleto y resuelve después. El único tracker que acepta el caos real de tu grupo.',
    color: 'from-amber-500/10 to-orange-500/10',
    border: 'hover:border-amber-300',
  },
  {
    emoji: '👥',
    title: 'Tiempo real',
    desc: 'Todos los miembros ven los cambios al instante. Colaboración sin conflictos.',
    color: 'from-green-500/10 to-emerald-500/10',
    border: 'hover:border-green-300',
  },
  {
    emoji: '💱',
    title: 'Múltiples monedas',
    desc: 'USD, PEN, EUR, CLP y más. Conversión automática con la moneda base del grupo.',
    color: 'from-teal-500/10 to-cyan-500/10',
    border: 'hover:border-teal-300',
  },
  {
    emoji: '📊',
    title: 'Liquidación mínima',
    desc: 'Algoritmo que minimiza transferencias. Menos movimientos, más claridad sobre quién debe qué.',
    color: 'from-rose-500/10 to-pink-500/10',
    border: 'hover:border-rose-300',
  },
  {
    emoji: '📤',
    title: 'Export Excel/CSV',
    desc: 'Descarga la sheet completa con un clic. Compatible con Excel, Google Sheets y Numbers.',
    color: 'from-indigo-500/10 to-violet-500/10',
    border: 'hover:border-indigo-300',
  },
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
  {
    n: '01',
    emoji: '✨',
    title: 'Crea tu grupo',
    desc: 'Dale un nombre, tipo y moneda base. Invita a tus compañeros con un link.',
  },
  {
    n: '02',
    emoji: '🎙️',
    title: 'Anota lo que pase',
    desc: 'Habla, toma una foto del recibo o escribe en texto libre. Vozpe lo estructura solo.',
  },
  {
    n: '03',
    emoji: '💸',
    title: 'Liquida sin drama',
    desc: 'Confirma entradas, ve el balance y sabe exactamente quién debe qué con mínimas transferencias.',
  },
];

const TESTIMONIALS = [
  {
    text: 'Organizamos un viaje de 12 personas con Vozpe. Lo que antes era un Excel caótico ahora es un registro limpio y actualizado en tiempo real.',
    author: 'Sofía R.',
    role: 'Viajera frecuente',
    avatar: '👩‍💼',
  },
  {
    text: 'La función de voz es mágica. Llego a casa, digo "mercado 45 soles" y ya está registrado. Sin abrir la app, sin teclear nada.',
    author: 'Carlos M.',
    role: 'Colega de departamento',
    avatar: '👨‍💻',
  },
  {
    text: 'Usábamos Splitwise pero era muy rígido. Vozpe nos deja anotar cualquier cosa y resolver después. Perfecto para grupos caóticos.',
    author: 'Andrea V.',
    role: 'Organizadora de eventos',
    avatar: '👩‍🎨',
  },
];

const STATS = [
  { value: '50K+', label: 'Grupos creados' },
  { value: '2M+', label: 'Entradas registradas' },
  { value: '$8M+', label: 'Gastos gestionados' },
  { value: '4.9★', label: 'Rating en App Store' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-base">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-12" />
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Funciones</a>
            <a href="#how" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Cómo funciona</a>
            <a href="#testimonials" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Testimonios</a>
            <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Precios</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium hidden md:block">
            Iniciar sesión
          </Link>
          <Link href="/auth/login" className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-btn shadow-xs">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 gap-7 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-vozpe-500/8 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-vozpe-500/6 blur-3xl" />
          <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-brand-green/8 blur-3xl" />
        </div>

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold shadow-xs">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-vozpe-500 animate-pulse" />
          ✦ La nueva forma de anotar gastos grupales
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl font-extrabold text-text-primary leading-[1.05] max-w-4xl tracking-tight">
          Anota ahora,<br />
          <span className="bg-gradient-to-r from-vozpe-500 via-vozpe-600 to-brand-green bg-clip-text text-transparent">
            ordena después.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="relative text-text-secondary text-xl max-w-2xl leading-relaxed">
          Registra gastos por <strong className="text-text-primary">voz</strong>, <strong className="text-text-primary">foto</strong> o <strong className="text-text-primary">texto</strong>.
          Vozpe los transforma en una sheet viva, editable y calculada en tiempo real.
          Sin formularios. Sin Excel. Sin drama.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-8 py-4 rounded-xl text-base font-bold transition-all hover:scale-105 shadow-fab"
          >
            Empezar gratis — sin tarjeta
          </Link>
          <Link href="/pricing" className="text-text-secondary hover:text-vozpe-500 transition-colors text-base font-medium group">
            Ver planes <span className="group-hover:translate-x-0.5 inline-block transition-transform">→</span>
          </Link>
        </div>

        <p className="relative text-text-tertiary text-xs">
          Disponible en iOS, Android y Web · Gratis para empezar
        </p>

        {/* App store badges */}
        <div className="relative flex items-center gap-3 mt-2">
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-text-primary text-white text-xs font-semibold hover:bg-text-secondary transition-colors shadow-card"
          >
            <span className="text-base">🍎</span>
            <span>App Store</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-text-primary text-white text-xs font-semibold hover:bg-text-secondary transition-colors shadow-card"
          >
            <span className="text-base">▶</span>
            <span>Google Play</span>
          </a>
        </div>

        {/* Mock UI preview */}
        <div className="relative mt-8 w-full max-w-2xl mx-auto">
          <div className="bg-bg-surface rounded-3xl border border-border-default shadow-glow p-4 md:p-6 overflow-hidden">
            {/* Mock header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
              <div>
                <p className="text-xs text-text-tertiary font-medium">Viaje a Chile · 4 miembros</p>
                <p className="text-xl font-bold text-text-primary font-mono">S/ 2,450.00</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold border border-warning/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  2 pendientes
                </span>
              </div>
            </div>
            {/* Mock table rows */}
            <div className="space-y-2">
              {[
                { desc: 'Almuerzo en Valparaíso', cat: '🍽 Comida', who: 'Ana', amount: 'S/ 120.00', status: 'ok' },
                { desc: 'Hotel 2 noches', cat: '🏨 Alojamiento', who: 'Carlos', amount: 'S/ 850.00', status: 'ok' },
                { desc: 'Taxi aeropuerto', cat: '🚗 Transporte', who: 'Sofía', amount: 'S/ 65.00', status: 'pending' },
                { desc: 'Supermercado varios…', cat: '🛒 Compras', who: 'Luis', amount: 'S/ 280.00', status: 'pending' },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors ${row.status === 'pending' ? 'bg-warning/5 border border-warning/10' : 'hover:bg-bg-elevated'}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {row.status === 'pending' && <div className="w-1 h-4 rounded-full bg-warning flex-shrink-0" />}
                    <span className="text-text-primary font-medium truncate">{row.desc}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className="text-text-tertiary hidden sm:block">{row.cat}</span>
                    <span className="text-text-secondary">{row.who}</span>
                    <span className="font-mono font-bold text-text-primary">{row.amount}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${row.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {row.status === 'pending' ? '⏳' : '✓'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Mock footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
              <span className="text-xs text-text-tertiary">4 entradas · 2 pendientes</span>
              <span className="text-sm font-bold text-vozpe-500 font-mono">S/ 1,315.00 confirmado</span>
            </div>
          </div>
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 bg-bg-surface rounded-2xl border border-border-default shadow-card px-3 py-2 text-xs font-semibold text-text-primary hidden md:block animate-float">
            🎙️ &ldquo;Taxi 40 soles entre 3&rdquo; → registrado ✓
          </div>
          <div className="absolute -bottom-4 -left-4 bg-bg-surface rounded-2xl border border-border-default shadow-card px-3 py-2 text-xs font-semibold text-success hidden md:block">
            ✓ Ana debe pagarte <span className="font-mono">S/ 48.50</span>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-12 bg-vozpe-500">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(stat => (
            <div key={stat.value}>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
              <p className="text-white/70 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────── */}
      <section id="how" className="px-6 md:px-10 py-20 bg-bg-surface border-y border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold mb-5">
              🚀 Tan simple como hablar
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-3">
              3 pasos para tener todo bajo control
            </h2>
            <p className="text-text-secondary text-lg">Sin tutoriales. Sin configuración. Solo anotar.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative text-center p-6 rounded-2xl bg-bg-base border border-border-subtle hover:border-vozpe-200 hover:shadow-card transition-all">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 translate-x-1/2 text-border-default text-lg z-10">→</div>
                )}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-vozpe-500 to-vozpe-600 text-white text-2xl mb-5 shadow-btn">
                  {s.emoji}
                </div>
                <div className="text-xs font-bold text-text-tertiary mb-2 tracking-wider">{s.n}</div>
                <h3 className="text-text-primary font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-10 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold mb-5">
            ⚡ Todo lo que necesitas
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-3">
            Sin apps extra. Sin hojas de cálculo.
          </h2>
          <p className="text-text-secondary text-lg">Solo Vozpe. Todo en uno.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className={`p-5 rounded-2xl bg-gradient-to-br ${f.color} border border-border-subtle ${f.border} hover:shadow-card transition-all cursor-default`}
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="text-text-primary font-semibold mb-1.5 text-sm">{f.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section id="testimonials" className="px-6 md:px-10 py-20 bg-bg-surface border-y border-border-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold mb-5">
              ❤️ Lo que dicen los usuarios
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
              Grupos reales, gastos reales
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="p-6 rounded-2xl bg-bg-base border border-border-subtle hover:border-vozpe-200 hover:shadow-card transition-all">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-vozpe-50 border border-vozpe-200 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-semibold">{t.author}</p>
                    <p className="text-text-tertiary text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vozpe-50 border border-vozpe-200 text-vozpe-600 text-xs font-semibold mb-5">
              💳 Planes y precios
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-3">
              Planes para cada grupo
            </h2>
            <p className="text-text-secondary text-lg">Empieza gratis, escala cuando lo necesites.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border flex flex-col transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-vozpe-500 to-vozpe-600 border-vozpe-700 shadow-fab md:scale-105'
                    : 'bg-bg-surface border-border-subtle shadow-card hover:border-vozpe-200 hover:shadow-card'
                }`}
              >
                {plan.highlight && (
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ✦ Más popular
                    </span>
                  </div>
                )}
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
                      <span className={`text-xs ${plan.highlight ? 'text-white' : 'text-success'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
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
      <section className="px-6 md:px-10 py-24 text-center relative overflow-hidden bg-bg-surface border-t border-border-subtle">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-b from-vozpe-500/8 to-transparent" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
            Tu grupo ya lo necesita.
          </h2>
          <p className="text-text-secondary text-lg mb-10 leading-relaxed">
            Sin registros tediosos. Sin Excel compartido.<br />
            Sin discusiones sobre quién pagó qué.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="inline-block bg-vozpe-500 hover:bg-vozpe-600 text-white px-10 py-4 rounded-xl text-base font-bold transition-all hover:scale-105 shadow-fab"
            >
              Crear cuenta gratis
            </Link>
            <Link href="/pricing" className="text-text-secondary hover:text-vozpe-500 transition-colors text-base font-medium">
              Ver planes →
            </Link>
          </div>
          <p className="text-text-tertiary text-xs mt-6">Sin tarjeta de crédito · iOS, Android y Web · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="px-6 md:px-10 py-10 border-t border-border-subtle bg-bg-base">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-vozpe.png" alt="Vozpe" className="h-10 mb-3" />
              <p className="text-text-tertiary text-sm max-w-xs leading-relaxed">
                La app colaborativa para registrar gastos sin fricción. Voz, foto o texto.
              </p>
            </div>
            {/* Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-semibold text-text-primary mb-3">Producto</p>
                <ul className="space-y-2 text-text-tertiary">
                  <li><a href="#features" className="hover:text-text-primary transition-colors">Funciones</a></li>
                  <li><Link href="/pricing" className="hover:text-text-primary transition-colors">Precios</Link></li>
                  <li><a href="#how" className="hover:text-text-primary transition-colors">Cómo funciona</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-text-primary mb-3">Empresa</p>
                <ul className="space-y-2 text-text-tertiary">
                  <li><a href="mailto:soporte@vozpe.com" className="hover:text-text-primary transition-colors">Soporte</a></li>
                  <li><a href="mailto:ventas@vozpe.com" className="hover:text-text-primary transition-colors">Ventas</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-text-primary mb-3">Legal</p>
                <ul className="space-y-2 text-text-tertiary">
                  <li><Link href="/terminos" className="hover:text-text-primary transition-colors">Términos</Link></li>
                  <li><Link href="/privacidad" className="hover:text-text-primary transition-colors">Privacidad</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border-subtle pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-text-tertiary text-xs">
              © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
            </p>
            <p className="text-text-tertiary text-xs">Hecho con ❤️ para grupos que se mueven rápido.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
