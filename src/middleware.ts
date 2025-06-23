import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken } from './app/api/auth/[...auth]/cookie'

export async function middleware (request: NextRequest) {
  // protected routes
  const protectedPaths = [
    '/dashboard',
    '/settings',
    '/profile',
    '/create-subreddit',
    '/r/create',
    '/submit'
  ]
  ///---------------------------------------------------------------------------------------------------------

  const authRoutes = ['/login', '/signup']

  const path = request.nextUrl.pathname
  const isAuthRoute = authRoutes.some(route => path === route)

  const cookieStore = request.cookies
  const sessionToken = cookieStore.get('session')?.value

  // If user is logged in and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    try {
      // Validate the session token
      const response = await fetch(
        new URL('/api/auth/validate-session', request.url),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken })
        }
      )

      if (response.ok) {
        // User is logged in, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Error validating session:', error)
      // If validation fails, continue to auth page
    }
  }

  //   protected path checking
  const isProtectedPath = protectedPaths.some(
    protectedPath =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  )

  if (isProtectedPath) {
    // Get the session cookie
    const cookieStore = request.cookies
    const sessionToken = cookieStore.get('session')?.value

    // If there's no session token, redirect to login
    if (!sessionToken) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    try {
      const response = await fetch(
        new URL('/api/auth/validate-session', request.url),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken })
        }
      )

      if (!response.ok) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error validating session:', error)
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/submit/:path*',
    '/r/create',
    '/login',
    '/signup',

    // Exclude API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
