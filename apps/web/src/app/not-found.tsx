import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-vozpe-50 border border-vozpe-200 flex items-center justify-center text-4xl mx-auto mb-6 shadow-card">
          🔍
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Página no encontrada</h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          La página que buscas no existe o fue movida.
          Puede que el enlace esté desactualizado.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/app"
            className="px-6 py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 text-white text-sm font-semibold transition-all shadow-btn hover:shadow-fab"
          >
            Ir a la app →
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-border-default text-text-secondary text-sm font-medium hover:border-vozpe-500 hover:text-vozpe-600 transition-colors bg-bg-surface"
          >
            Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
