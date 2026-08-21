// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Dev-only logger — never prints in production, and never prints token/payload
// contents even in dev, so decoded JWTs can't end up pasted into a bug report.
const isDev = process.env.NODE_ENV !== 'production';
const devLog = (...args) => { if (isDev) console.log(...args); };

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');

    // For development, you might want to allow continuing
    if (isDev) {
      console.warn('Continuing without JWT verification in development');
      return NextResponse.next();
    }

    // For production, return error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL('/error', request.url));
  }

  // Skip middleware for public APIs (but NOT for login/register pages)
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  try {
    const token = request.cookies.get('token')?.value;

    // For login/register pages, check if user is already authenticated
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      if (token) {
        // Verify the token to ensure it's valid
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET)
        );

        // Redirect to dashboard or home page if already authenticated
        const redirectUrl = request.nextUrl.searchParams.get('from') ||
                           (payload.role === 'admin' ? '/dashboard' : '/');
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // No token found, allow access to login/register pages
      return NextResponse.next();
    }

    // For protected routes, require authentication
    if (!token) throw new Error('No token');

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // Role validation for admin routes — log only a boolean in dev, never the payload
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    if (isAdminRoute && payload.role !== 'admin') {
      devLog('Admin access denied for role:', payload.role);
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    devLog('Auth error:', error.message);

    // Handle specific error types
    if (error.code === 'ERR_JWT_EXPIRED') {
      // Clear expired token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // For login/register pages, allow access even with auth errors
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next();
    }

    // For API routes, return JSON response instead of redirect.
    // Don't leak internal error.message details to the client.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Redirect to login for other protected routes
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/user/:path*',
    '/settings/:path*',
    '/api/private/:path*',
    '/login',
    '/register',
  ]
};