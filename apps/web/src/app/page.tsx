import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-base">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-surface shadow-sm">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-7" />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-btn"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-default text-vozpe-500 text-xs font-semibold">
          ✦ Captura inteligente de gastos
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight max-w-3xl">
          Habla, toma foto
          <br />
          <span className="text-vozpe-500">o escribe</span>
        </h1>

        <p className="text-text-secondary text-xl max-w-xl">
          Vozpe transforma entradas caóticas en una tabla viva, editable, calculada y compartida en tiempo real.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:scale-105 shadow-btn"
          >
            Empezar gratis
          </Link>
          <a
            href="#features"
            className="text-text-secondary hover:text-text-primary transition-colors text-base font-medium"
          >
            Ver cómo funciona →
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
          El cuaderno operativo inteligente para grupos
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { emoji: '🎙️', title: 'Captura por voz',          desc: 'Dicta y listo. Whisper transcribe, Claude Haiku estructura.' },
            { emoji: '📋', title: 'Sheet viva',                desc: 'Una spreadsheet hermosa y usable en móvil. Edición inline, filtros, totales.' },
            { emoji: '⚡', title: 'Pendientes inteligentes',   desc: 'Guarda incompleto y resuelve después. El modo caos funcional.' },
            { emoji: '👥', title: 'Colaboración en tiempo real', desc: 'Todos los miembros ven los cambios al instante con Supabase Realtime.' },
            { emoji: '💱', title: 'Múltiples monedas',         desc: 'Define la moneda base y Vozpe convierte automáticamente.' },
            { emoji: '📊', title: 'Liquidación automática',    desc: 'Algoritmo de liquidación mínima. Menos transferencias, más claridad.' },
          ].map(f => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-default hover:shadow-card transition-all"
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="text-text-primary font-semibold mb-2">{f.title}</h3>
              <p className="text-text-tertiary text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-3xl bg-bg-surface border border-border-default shadow-card">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Anota ahora, ordena después.
          </h2>
          <p className="text-text-secondary mb-8">
            Únete a los primeros grupos que ya usan Vozpe para sus gastos.
          </p>
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:scale-105 inline-block shadow-btn"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border-subtle text-center text-text-tertiary text-sm">
        © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
      </footer>
    </main>
  );
}
