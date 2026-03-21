import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1E1E2E]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-vozpe-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-[#F0F0FF] font-semibold text-lg">Vozpe</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-[#9090B8] hover:text-[#F0F0FF] transition-colors text-sm"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A26] border border-[#2A2A45] text-[#818CF8] text-xs font-medium">
          ✦ Captura inteligente de gastos
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-[#F0F0FF] leading-tight max-w-3xl">
          Habla, toma foto
          <br />
          <span className="text-vozpe-400">o escribe</span>
        </h1>

        <p className="text-[#9090B8] text-xl max-w-xl">
          Vozpe transforma entradas caóticas en una tabla viva, editable, calculada y compartida en tiempo real.
        </p>

        <div className="flex items-center gap-4 mt-4">
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:scale-105"
          >
            Empezar gratis
          </Link>
          <a
            href="#features"
            className="text-[#9090B8] hover:text-[#F0F0FF] transition-colors text-base"
          >
            Ver cómo funciona →
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-[#F0F0FF] text-center mb-12">
          El cuaderno operativo inteligente para grupos
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              emoji: '🎙️',
              title: 'Captura por voz',
              desc: 'Dicta y listo. Whisper transcribe, Claude Haiku estructura.',
            },
            {
              emoji: '📋',
              title: 'Sheet viva',
              desc: 'Una spreadsheet hermosa y usable en móvil. Edición inline, filtros, totales.',
            },
            {
              emoji: '⚡',
              title: 'Pendientes inteligentes',
              desc: 'Guarda incompleto y resuelve después. El modo caos funcional.',
            },
            {
              emoji: '👥',
              title: 'Colaboración en tiempo real',
              desc: 'Todos los miembros ven los cambios al instante con Supabase Realtime.',
            },
            {
              emoji: '💱',
              title: 'Múltiples monedas',
              desc: 'Define la moneda base y Vozpe convierte automáticamente.',
            },
            {
              emoji: '📊',
              title: 'Liquidación automática',
              desc: 'Algoritmo de liquidación mínima. Menos transferencias, más claridad.',
            },
          ].map(f => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-[#111118] border border-[#1E1E2E] hover:border-[#2A2A45] transition-colors"
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="text-[#F0F0FF] font-semibold mb-2">{f.title}</h3>
              <p className="text-[#5A5A80] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-3xl bg-[#111118] border border-[#2A2A45]">
          <h2 className="text-3xl font-bold text-[#F0F0FF] mb-4">
            Anota ahora, ordena después.
          </h2>
          <p className="text-[#9090B8] mb-8">
            Únete a los primeros grupos que ya usan Vozpe para sus gastos.
          </p>
          <Link
            href="/auth/login"
            className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:scale-105 inline-block"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-[#1E1E2E] text-center text-[#5A5A80] text-sm">
        © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
      </footer>
    </main>
  );
}
