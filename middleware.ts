import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const encoder = new TextEncoder();

async function verifyToken(token: string) {
  try {
    const secret = encoder.encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = pathname === '/' || pathname.startsWith('/dashboard');

  // Redirect if trying to access protected route without token
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token) {
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const role = (decoded as any).role;

    // Optional: Block /admin route if not admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
