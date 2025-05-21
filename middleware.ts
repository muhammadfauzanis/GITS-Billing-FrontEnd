import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Kalau belum login dan buka halaman yang perlu auth (dashboard), redirect ke login
  const protectedPaths = ['/dashboard'];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Kalau sudah login dan buka '/', redirect ke /dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/dashboard/:path*'],
};
