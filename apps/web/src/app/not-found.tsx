import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Página no encontrada</h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/app"
            className="px-6 py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 text-white text-sm font-semibold transition-colors shadow-btn"
          >
            Ir a la app
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-border-default text-text-secondary text-sm font-medium hover:border-vozpe-500 hover:text-vozpe-600 transition-colors"
          >
            Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
