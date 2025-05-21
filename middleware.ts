import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || '';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths yang dilindungi berdasarkan role
  const isAdminPath = pathname.startsWith('/admin');
  const isDashboardPath = pathname.startsWith('/dashboard');

  // Tidak ada token, tapi masuk ke path dilindungi
  if (!token && (isAdminPath || isDashboardPath)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika ada token → decode dan validasi role
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET) as { role: string };

      if (isAdminPath && decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (err) {
      console.error('Invalid token:', err);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}
