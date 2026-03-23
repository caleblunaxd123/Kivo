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
    <html lang="es">
      <body style={{ margin: 0, background: '#F4F6FB', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0C1A2E', marginBottom: '8px' }}>
            Algo salió mal
          </h1>
          <p style={{ color: '#374E6B', fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
            Hubo un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={reset}
              style={{
                padding: '10px 20px', borderRadius: '12px', background: '#1F6FE5',
                color: 'white', fontSize: '14px', fontWeight: 600,
                border: 'none', cursor: 'pointer',
              }}
            >
              Intentar de nuevo
            </button>
            <a
              href="/"
              style={{
                padding: '10px 20px', borderRadius: '12px', border: '1px solid #BDD8F0',
                color: '#4A6070', fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              }}
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
