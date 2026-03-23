'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase';

type Mode = 'login' | 'signup' | 'magic';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="20" viewBox="0 0 814 1000" aria-hidden fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-101.9C115.4 784.6 68.2 688.1 68.2 597.5c0-174.2 113.4-266.4 224.9-266.4 59.1 0 108.3 38.9 145.2 38.9 35.2 0 90.5-41.3 154.5-41.3 25 0 108.2 2.6 168.6 76.8zm-97.2-183.8c28.5-34 48.1-81.4 48.1-128.7 0-6.5-.6-13-1.9-18.3-45.3 1.7-99.5 31.3-131.8 68-26.3 30.2-49.8 77.5-49.8 125.5 0 6.5 1.3 13 1.9 15.1 3.2.6 8.4 1.3 13.6 1.3 41 0 92.8-27.8 119.9-62.9z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [mode,        setMode]        = useState<Mode>('login');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [magicSent,   setMagicSent]   = useState(false);
  const [error,       setError]       = useState('');
  const [showPass,    setShowPass]    = useState(false);

  const reset = () => { setError(''); setMagicSent(false); };

  async function handleGoogle() {
    setOauthLoading('google'); setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  }

  async function handleApple() {
    setOauthLoading('apple'); setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setMagicSent(true);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true); setError('');

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (error) { setError(error.message); setLoading(false); }
      else router.push('/app');
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else if (data.session) {
        router.push('/app');
      } else {
        setMagicSent(true); // confirmation email sent
      }
    }
  }

  // ── Magic link sent ──────────────────────────────────────────────────────
  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-bg-base">
        <div className="max-w-sm w-full text-center space-y-5 p-8 bg-bg-surface rounded-2xl border border-border-subtle shadow-card">
          <div className="text-5xl">📬</div>
          <h1 className="text-2xl font-bold text-text-primary">Revisa tu correo</h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            {mode === 'signup'
              ? 'Te enviamos un enlace de confirmación a '
              : 'Enviamos un enlace mágico a '}
            <span className="text-text-primary font-semibold">{email}</span>.
            <br />Haz clic en él para {mode === 'signup' ? 'activar tu cuenta' : 'entrar'}.
          </p>
          <button onClick={() => { reset(); setMode('login'); }}
            className="text-vozpe-500 hover:text-vozpe-600 text-sm font-medium transition-colors">
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const isEmailPass = mode === 'login' || mode === 'signup';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-base relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-vozpe-500/8 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-violet-500/6 blur-3xl" />
      </div>

      <div className="relative max-w-sm w-full space-y-5">

        {/* Logo + tagline */}
        <div className="text-center space-y-2 mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-16 mx-auto" />
          <p className="text-text-secondary text-sm">Anota ahora, ordena después.</p>
        </div>

        {/* Card */}
        <div className="bg-bg-surface rounded-2xl border border-border-subtle shadow-card p-6 space-y-3">

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-bg-base border border-border-default hover:border-vozpe-500 hover:bg-vozpe-50 text-text-primary font-medium text-sm transition-all disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <svg className="animate-spin h-4 w-4 text-text-tertiary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : <GoogleIcon />}
            Continuar con Google
          </button>

          {/* Apple */}
          <button
            onClick={handleApple}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#000] hover:bg-[#1a1a1a] text-white font-medium text-sm transition-all disabled:opacity-50"
          >
            {oauthLoading === 'apple' ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : <AppleIcon />}
            Continuar con Apple
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-tertiary text-xs font-medium">o</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl bg-bg-base border border-border-subtle p-0.5 text-xs font-semibold">
            {(['login', 'signup', 'magic'] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); reset(); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === m
                    ? 'bg-bg-surface text-vozpe-600 shadow-xs border border-border-default'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                {m === 'login' ? 'Ingresar' : m === 'signup' ? 'Registrarse' : 'Enlace ✉'}
              </button>
            ))}
          </div>

          {/* Form */}
          {mode === 'magic' ? (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border-default focus:border-vozpe-500 focus:outline-none focus:ring-2 focus:ring-vozpe-500/20 text-text-primary placeholder-text-tertiary text-sm transition-all"
              />
              {error && <p className="text-danger text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-btn"
              >
                {loading ? 'Enviando…' : 'Enviar enlace mágico'}
              </button>
              <p className="text-text-tertiary text-xs text-center">
                Recibirás un enlace para entrar sin contraseña.
              </p>
            </form>
          ) : (
            <form onSubmit={handlePassword} className="space-y-3">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border-default focus:border-vozpe-500 focus:outline-none focus:ring-2 focus:ring-vozpe-500/20 text-text-primary placeholder-text-tertiary text-sm transition-all"
              />
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border-default focus:border-vozpe-500 focus:outline-none focus:ring-2 focus:ring-vozpe-500/20 text-text-primary placeholder-text-tertiary text-sm transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs"
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {error && <p className="text-danger text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full py-3 rounded-xl bg-vozpe-500 hover:bg-vozpe-600 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-btn"
              >
                {loading
                  ? (mode === 'login' ? 'Ingresando…' : 'Creando cuenta…')
                  : (mode === 'login' ? 'Ingresar' : 'Crear cuenta')
                }
              </button>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('magic'); reset(); }}
                  className="w-full text-text-tertiary hover:text-vozpe-500 text-xs text-center transition-colors"
                >
                  Olvidé mi contraseña — usar enlace mágico
                </button>
              )}
            </form>
          )}
        </div>

        <p className="text-center text-text-tertiary text-xs">
          Al continuar aceptas nuestros{' '}
          <Link href="/terminos" className="text-vozpe-500 hover:underline">Términos</Link>
          {' '}y{' '}
          <Link href="/privacidad" className="text-vozpe-500 hover:underline">Privacidad</Link>.
        </p>

        <p className="text-center text-text-tertiary text-xs">
          <Link href="/" className="hover:text-text-primary transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
