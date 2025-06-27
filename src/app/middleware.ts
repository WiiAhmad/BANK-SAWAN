import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  // Only apply to API routes that need authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Access token is missing' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Add user info to headers for downstream handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', (decoded as any).userId)
    requestHeaders.set('x-user-email', (decoded as any).email)
    requestHeaders.set('x-user-role', (decoded as any).role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
}

export const config = {
  matcher: ['/api/protected/:path*']
}