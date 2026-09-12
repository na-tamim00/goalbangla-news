import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'goalbangla-dev-jwt-secret-key-32charsmin!';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except public onboarding / auth routes
  const isPublicAdminRoute =
    pathname === '/admin' ||
    pathname === '/admin/login' ||
    pathname === '/admin/setup' ||
    pathname === '/admin/verify-email';

  if (pathname.startsWith('/admin') && !isPublicAdminRoute) {
    const token = req.cookies.get('goalbangla_session')?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, key);
      return NextResponse.next();
    } catch (err) {
      // Invalid or expired JWT
      const loginUrl = new URL('/admin/login', req.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('goalbangla_session', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
