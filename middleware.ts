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
  console.log('token', token);
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith('/admin');
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isRootPath = pathname === '/';

  // if (!token && (isAdminPath || isDashboardPath)) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  // // Token exists → verify
  // if (token) {
  //   const decoded = await verifyToken(token);

  //   if (!decoded) {
  //     return NextResponse.redirect(new URL('/', request.url));
  //   }

  //   const role = (decoded as any).role;

  //   if (isAdminPath && role !== 'admin') {
  //     return NextResponse.redirect(new URL('/dashboard', request.url));
  //   }

  //   if (isRootPath) {
  //     return NextResponse.redirect(new URL('/dashboard', request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
