'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Vozpe app error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
      <div className="text-5xl mb-4">😵</div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Error inesperado</h2>
      <p className="text-text-secondary text-sm mb-8 max-w-sm leading-relaxed">
        Algo falló al cargar esta sección. Intenta de nuevo o ve a tus grupos.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-vozpe-500 text-white text-sm font-semibold hover:bg-vozpe-600 transition-colors shadow-btn"
        >
          Reintentar
        </button>
        <Link
          href="/app"
          className="px-5 py-2.5 rounded-xl border border-border-default text-text-secondary text-sm font-medium hover:border-vozpe-500 hover:text-vozpe-600 transition-colors"
        >
          Ir a grupos
        </Link>
      </div>
    </div>
  );
}
