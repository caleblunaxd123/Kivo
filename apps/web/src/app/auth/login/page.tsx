'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '../../../lib/supabase';

export default function LoginPage() {
  const supabase = getSupabaseClient();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-bg-base">
        <div className="max-w-sm w-full text-center space-y-4 p-8 bg-bg-surface rounded-2xl border border-border-subtle shadow-card">
          <div className="text-5xl">📬</div>
          <h1 className="text-2xl font-bold text-text-primary">Revisa tu correo</h1>
          <p className="text-text-secondary text-sm">
            Enviamos un enlace mágico a{' '}
            <span className="text-text-primary font-semibold">{email}</span>.
            <br />
            Haz clic en él para entrar.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="text-vozpe-500 hover:text-vozpe-600 text-sm font-medium transition-colors"
          >
            Usar otro correo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-base">
      <div className="max-w-sm w-full space-y-5">
        {/* Logo */}
        <div className="text-center space-y-3 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-12 mx-auto" />
          <p className="text-text-secondary text-sm">Anota ahora, ordena después.</p>
        </div>

        {/* Card */}
        <div className="bg-bg-surface rounded-2xl border border-border-subtle shadow-card p-6 space-y-4">

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-bg-base border border-border-default hover:border-vozpe-500 hover:bg-bg-elevated text-text-primary font-medium text-sm transition-all disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-tertiary text-xs font-medium">o</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Magic link */}
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border-default focus:border-vozpe-500 focus:outline-none focus:ring-2 focus:ring-vozpe-500/20 text-text-primary placeholder-text-tertiary transition-all text-sm"
            />
            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-btn"
            >
              {loading ? 'Enviando…' : 'Enviar enlace mágico'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-tertiary text-xs">
          Al continuar aceptas nuestros{' '}
          <Link href="/" className="text-vozpe-500 hover:underline">Términos de uso</Link>
          {' '}y{' '}
          <Link href="/" className="text-vozpe-500 hover:underline">Política de privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
