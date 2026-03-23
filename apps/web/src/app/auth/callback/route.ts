import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin;
  const code  = requestUrl.searchParams.get('code');
  const next  = requestUrl.searchParams.get('next') ?? '/app';
  const error = requestUrl.searchParams.get('error');
  const errorDesc = requestUrl.searchParams.get('error_description');

  // Supabase devuelve error en la URL cuando el usuario rechaza OAuth
  if (error) {
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', errorDesc ?? error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options } as any);
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options } as any);
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const loginUrl = new URL('/auth/login', baseUrl);
      loginUrl.searchParams.set('error', exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirigir a la app o a la ruta `next` solicitada
  const redirectUrl = new URL(next.startsWith('/') ? next : '/app', baseUrl);
  return NextResponse.redirect(redirectUrl);
}
