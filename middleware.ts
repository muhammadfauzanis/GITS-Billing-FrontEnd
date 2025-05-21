import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (err) {
    console.error('❌ Invalid token:', err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith('/admin');
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isRootPath = pathname === '/';

  if (!token && (isAdminPath || isDashboardPath)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token) {
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const role = decoded.role;

    if (isAdminPath && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isRootPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*'],
};
