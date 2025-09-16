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
  
  // Skip middleware for auth pages and public APIs
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/public')) {
    console.log('Skipping auth check for public path:', pathname);
    return NextResponse.next();
  }
  
  try {
    const token = request.cookies.get('token')?.value;
    console.log('Token found:', !!token);
    
    if (!token) throw new Error('No token');
    
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    
    console.log('Token payload:', payload);
    
    // If user is on login page but already authenticated, redirect to dashboard
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      console.log('Already authenticated, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Role validation
    if (request.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin') {
      console.log('Admin access denied');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.log('Auth error:', error.message);
    
    // Don't redirect to login if we're already on auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next();
    }
    
    // For API routes, return JSON response instead of redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
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