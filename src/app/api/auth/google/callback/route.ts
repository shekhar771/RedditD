import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import {
  createSession,
  generateRandomSessionToken
} from '@/app/api/auth/[...auth]/session'
import { setSessionCookie } from '@/app/api/auth/[...auth]/cookie'
import { baseUrl } from '@/lib/auth' // Import baseUrl

export async function GET (req: NextRequest) {
  try {
    const url = new URL(req.url)
    const state = url.searchParams.get('state')
    const code = url.searchParams.get('code')

    if (!state || !code) {
      // Redirect if state or code is missing
      return NextResponse.redirect(
        new URL('/login?error=missing_params', baseUrl)
      )
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get('google_oauth_state')?.value
    const codeVerifier = cookieStore.get('google_code_verifier')?.value

    if (!storedState || !codeVerifier || state !== storedState) {
      // Clear cookies and redirect if state is invalid
      cookieStore.delete('google_oauth_state')
      cookieStore.delete('google_code_verifier')
      return NextResponse.redirect(
        new URL('/login?error=invalid_state', baseUrl)
      )
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        // --- THIS IS THE FIX ---
        // The redirect_uri must be an absolute URL and exactly match
        // the one registered in your Google Cloud Console.
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        code_verifier: codeVerifier!
      })
    })

    // Log the raw response for debugging if the fetch fails
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token fetch error:', errorText)
      // IMPORTANT: The error from Google is in this 'errorText' variable.
      // Check your server logs on Vercel to see the detailed error message.
      return NextResponse.redirect(
        new URL('/login?error=token_fetch_failed', baseUrl)
      )
    }

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_access_token', baseUrl)
      )
    }

    // Fetch user information from Google
    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      }
    )

    if (!userResponse.ok) {
      console.error('User fetch error:', await userResponse.text())
      return NextResponse.redirect(
        new URL('/login?error=user_fetch_failed', baseUrl)
      )
    }

    const userInfo = await userResponse.json()
    const baseUsername = userInfo.email.split('@')[0]
    let username = baseUsername

    // Find existing user or create a new one
    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {
        name: userInfo.name,
        image: userInfo.picture,
        emailVerified: new Date()
      },
      create: {
        email: userInfo.email,
        username: username, // Initially set username
        name: userInfo.name,
        image: userInfo.picture,
        emailVerified: new Date()
      }
    })

    // Logic to ensure the username is unique
    if (!user.username) {
      let usernameExists = true
      let attempt = 0
      const maxAttempts = 5

      while (usernameExists && attempt < maxAttempts) {
        if (attempt > 0) {
          const randomDigits = Math.floor(1000 + Math.random() * 9000)
          username = `${baseUsername}${randomDigits}`
        }

        const existingUser = await prisma.user.findUnique({
          where: { username }
        })

        if (!existingUser) {
          usernameExists = false
          await prisma.user.update({
            where: { id: user.id },
            data: { username }
          })
        }
        attempt++
      }

      if (usernameExists) {
        // Handle the rare case where a unique username couldn't be generated
        throw new Error('Could not generate a unique username.')
      }
    }

    // Create a session for the user
    const sessionToken = generateRandomSessionToken()
    const session = await createSession(sessionToken, user.id)
    const response = NextResponse.redirect(new URL('/', baseUrl)) // Redirect to home
    await setSessionCookie(sessionToken, session.expires, response)

    // Clean up OAuth cookies after successful login
    cookieStore.delete('google_oauth_state')
    cookieStore.delete('google_code_verifier')

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', baseUrl))
  }
}
