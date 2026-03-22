import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options } as any);
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options } as any);
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '', ...options } as any);
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options } as any);
        },
      },
    }
  );

  // Refresh session — mantiene el token activo en cada request
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Proteger /app/** — redirigir a login si no hay sesión
  if (pathname.startsWith('/app') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Si ya tiene sesión y va al login/callback, redirigir al app
  if (pathname.startsWith('/auth/login') && user) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo-vozpe.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
