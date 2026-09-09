import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'goalbangla-dev-jwt-secret-key-32charsmin!';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle API requests with CORS headers for cross-domain deployments (Netlify frontend -> Vercel backend)
  if (pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin') || '*';

    // Handle preflight OPTIONS requests immediately
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cookie, Accept',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie, Accept');
    return response;
  }

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
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