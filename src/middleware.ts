import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'homeservice-cooperative-secret-super-secure-key-2026'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected paths
  const isAdminPath = pathname.startsWith('/admin');
  const isProviderPath = pathname.startsWith('/provider') && !pathname.startsWith('/provider/register');
  const isCustomerPath = pathname.startsWith('/customer');

  if (!isAdminPath && !isProviderPath && !isCustomerPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('homeservice_token')?.value;

  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload as any).role;

    // Admin guard
    if (isAdminPath) {
      if (role !== 'COOPERATIVE_ADMIN' && role !== 'FEDERATION_ADMIN') {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    }

    // Provider guard (Workers, and Cooperative Admins for oversight)
    if (isProviderPath) {
      if (role !== 'WORKER' && role !== 'COOPERATIVE_ADMIN' && role !== 'FEDERATION_ADMIN') {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    }

    // Customer guard (Customers, Family Members, and Cooperative Admins for support)
    if (isCustomerPath) {
      if (
        role !== 'CUSTOMER' &&
        role !== 'FAMILY_MEMBER' &&
        role !== 'COOPERATIVE_ADMIN' &&
        role !== 'FEDERATION_ADMIN'
      ) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware token verification error:', err);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*', '/customer/:path*'],
};
