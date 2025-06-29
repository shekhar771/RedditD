// app/api/auth/github/route.ts
import { generateState } from 'arctic'
import { baseUrl, github } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET (): Promise<Response> {
  try {
    const state = generateState()
    const url = github.createAuthorizationURL(state, [
      'read:user',
      'user:email'
    ])

    // Add debugging
    console.log('GitHub OAuth URL:', url.toString())
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: baseUrl
    })

    const cookieStore = await cookies()
    cookieStore.set('github_oauth_state', state, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 10, // 10 minutes
      sameSite: 'lax'
    })
    console.log('GitHub OAuth initialization error:')

    return NextResponse.redirect(url.toString())
  } catch (error) {
    console.error('GitHub OAuth initialization error:', { error })
    return NextResponse.redirect(
      new URL('/login?error=oauth_init_failed', baseUrl)
    )
  }
}
