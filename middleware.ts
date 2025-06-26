import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  const publicPaths = ['/', '/set-password', '/unregistered'];

  if (sessionError) {
    console.error('Supabase session error:', sessionError);
  }

  // --- USER BELUM LOGIN DAN AKSES HALAMAN TERPROTEKSI ---
  if (!session && !publicPaths.includes(pathname)) {
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // --- USER SUDAH LOGIN ---
  if (session) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, is_password_set')
      .eq('supabase_auth_id', session.user.id)
      .single();

    // --- GAGAL AMBIL PROFILE ---
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Middleware profile error:', profileError);
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/', req.url));
    }

    // --- USER BELUM TERDAFTAR DI TABLE INTERNAL ---
    if (!profile) {
      return NextResponse.redirect(new URL('/unregistered', req.url));
    }

    // --- USER SUDAH LOGIN TAPI AKSES '/' (LOGIN) ---
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(profile.role === 'admin' ? '/admin' : '/dashboard', req.url)
      );
    }

    // --- PASSWORD BELUM DITENTUKAN, HARUS SET PASSWORD DULU ---
    if (!profile.is_password_set && pathname !== '/set-password') {
      return NextResponse.redirect(
        new URL(`/set-password?email=${session.user.email}`, req.url)
      );
    }

    // --- JANGAN ALOKASIKAN HALAMAN LOGIN /set-password /unregistered KE USER YANG SUDAH SIAP ---
    if (publicPaths.includes(pathname) && profile.is_password_set) {
      return NextResponse.redirect(
        new URL(profile.role === 'admin' ? '/admin' : '/dashboard', req.url)
      );
    }

    // --- ROLE-BASED PROTECT ADMIN ---
    if (
      profile.role === 'admin' &&
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/dashboard')
    ) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    if (profile.role !== 'admin' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/',
    '/set-password',
    '/unregistered',
  ],
};
