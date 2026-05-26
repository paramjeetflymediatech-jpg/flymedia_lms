import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-lms-jwt-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if path is protected
  const isDashboardRoute = path.startsWith('/dashboard');
  const isAdminRoute = path.startsWith('/admin');

  if (isDashboardRoute || isAdminRoute) {
    const sessionToken = request.cookies.get('lms-session')?.value;

    if (!sessionToken) {
      // Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
      const userRole = (payload as any).role;

      if (isAdminRoute && userRole !== 'ADMIN') {
        // Prevent student accessing admin dashboard
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Token is invalid/expired
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
