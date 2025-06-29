// app/api/auth/google/route.ts
import { generateState, generateCodeVerifier } from 'arctic'
import { google } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET (): Promise<Response> {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()

  const cookieStore = await cookies()
  cookieStore.delete('google_oauth_state')
  cookieStore.delete('google_code_verifier')

  const url = google.createAuthorizationURL(state, codeVerifier, [
    'openid',
    'profile',
    'email'
  ])
  console.log('OAuth redirect URL:', url.toString())

  cookieStore.set('google_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax'
  })

  cookieStore.set('google_code_verifier', codeVerifier, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax'
  })

  return NextResponse.redirect(url.toString())
}
