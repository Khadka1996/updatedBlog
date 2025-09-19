// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware triggered for:', pathname);
  
  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    
    // For development, you might want to allow continuing
    if (process.env.NODE_ENV === 'development') {
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
    console.log('Skipping auth check for public API path:', pathname);
    return NextResponse.next();
  }
  
  try {
    const token = request.cookies.get('token')?.value;
    console.log('Token found:', !!token);
    
    // For login/register pages, check if user is already authenticated
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      if (token) {
        // Verify the token to ensure it's valid
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET)
        );
        
        console.log('Already authenticated, redirecting to dashboard');
        
        // Redirect to dashboard or home page if already authenticated
        const redirectUrl = request.nextUrl.searchParams.get('from') || 
                           (payload.role === 'admin' ? '/dashboard' : '/');
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
      
      // No token found, allow access to login/register pages
      console.log('No token found, allowing access to auth pages');
      return NextResponse.next();
    }
    
    // For protected routes, require authentication
    if (!token) throw new Error('No token');
    
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    
    console.log('Token payload:', payload);
    
    // Role validation for admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin') {
      console.log('Admin access denied');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.log('Auth error:', error.message);
    
    // Handle specific error types
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.log('JWT token expired');
      // Clear expired token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
    
    // For login/register pages, allow access even with auth errors
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      console.log('Auth error on auth page, allowing access');
      return NextResponse.next();
    }
    
    // For API routes, return JSON response instead of redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required', details: error.message },
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