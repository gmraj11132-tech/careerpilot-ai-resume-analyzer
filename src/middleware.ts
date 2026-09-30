import { NextRequest, NextResponse } from 'next/server';

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
