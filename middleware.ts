// File: /middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get response headers
  const response = NextResponse.next();
  
  // Add Cross-Origin Isolation headers
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  
  return response;
}

// Only apply these headers to the assistant page to avoid affecting other parts
// of your application that might have cross-origin requirements
export const config = {
  matcher: ['/assistant/:path*'],
};