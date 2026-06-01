import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-lms-jwt-key-change-in-production'
);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isDashboardRoute = path.startsWith('/dashboard');
  // Exclude /admin/login from protection so it's always accessible
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';

  if (isDashboardRoute || isAdminRoute) {
    const sessionToken = request.cookies.get('lms-session')?.value;

    if (!sessionToken) {
      const url = request.nextUrl.clone();
      // Admin routes → dedicated admin login; dashboard → generic login
      url.pathname = isAdminRoute ? '/admin/login' : '/login';
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
      const userRole = (payload as any).role;

      if (isAdminRoute && userRole !== 'ADMIN') {
        // Students can't access admin — send them to their dashboard
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } catch {
      // Token invalid/expired — clear cookie and redirect
      const url = request.nextUrl.clone();
      url.pathname = isAdminRoute ? '/admin/login' : '/login';
      url.searchParams.set('callbackUrl', path);
      const response = NextResponse.redirect(url);
      response.cookies.delete('lms-session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
