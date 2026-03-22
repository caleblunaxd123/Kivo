'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Vozpe error]', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-[#F4F9FD] px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Algo salió mal</h1>
          <p className="text-[#4A6070] text-sm mb-8 leading-relaxed">
            Hubo un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl bg-[#1F6FE5] text-white text-sm font-semibold hover:bg-[#1557C8] transition-colors"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-[#BDD8F0] text-[#4A6070] text-sm font-medium hover:border-[#1F6FE5] hover:text-[#1F6FE5] transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
