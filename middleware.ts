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

  if (sessionError) {
    console.error('Middleware Supabase session error:', sessionError);
  }

  const { pathname } = req.nextUrl;
  const publicPaths = ['/', '/set-password'];

  if (!session && !publicPaths.includes(pathname)) {
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, is_password_set')
      .eq('supabase_auth_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Middleware profile error:', profileError);
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (pathname !== '/set-password' && profile && !profile.is_password_set) {
      return NextResponse.redirect(
        new URL(`/set-password?email=${session.user.email}`, req.url)
      );
    }

    if (publicPaths.includes(pathname) && profile && profile.is_password_set) {
      return NextResponse.redirect(
        new URL(profile?.role === 'admin' ? '/admin' : '/dashboard', req.url)
      );
    }

    if (profile?.role === 'admin' && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    if (profile?.role !== 'admin' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/', '/set-password'],
};
