import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a simplified middleware that doesn't actually check authentication
  // since we're using client-side auth. It just ensures API routes work properly.
  return NextResponse.next()
}

export const config = {
  matcher: [
    // We're not matching any routes since we're handling auth client-side
    // This is just a placeholder to keep the middleware file
  ],
}
