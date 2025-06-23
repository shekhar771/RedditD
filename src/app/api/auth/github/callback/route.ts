// app/api/auth/github/callback/route.ts
import { github } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createSession,
  generateRandomSessionToken
} from '@/app/api/auth/[...auth]/session'
import { setSessionCookie } from '@/app/api/auth/[...auth]/cookie'

export async function GET (request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=missing_params', request.url)
      )
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get('github_oauth_state')?.value

    if (!storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL('/login?error=state_mismatch', request.url)
      )
    }

    // Get the tokens from GitHub
    const tokens = await github.validateAuthorizationCode(code)
    const accessToken = tokens.data.access_token

    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/login?error=no_token', request.url)
      )
    }

    // Fetch GitHub user data
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${accessToken}`,
        'User-Agent': 'NextJS-App'
      }
    })

    if (!githubUserResponse.ok) {
      return NextResponse.redirect(
        new URL('/login?error=github_api', request.url)
      )
    }

    const githubUser = await githubUserResponse.json()

    // Fetch user's emails
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${accessToken}`,
        'User-Agent': 'NextJS-App'
      }
    })

    const emails = await emailsResponse.json()
    const primaryEmail = emails.find((email: any) => email.primary)

    if (!primaryEmail) {
      return NextResponse.redirect(
        new URL('/login?error=no_email', request.url)
      )
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: primaryEmail.email }, { username: githubUser.login }]
      }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: primaryEmail.email,
          username: githubUser.login,
          name: githubUser.name || githubUser.login,
          image: githubUser.avatar_url,
          emailVerified: primaryEmail.verified ? new Date() : null
        }
      })
    }

    // Update or create account
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: githubUser.id.toString()
        }
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'github',
        providerAccountId: githubUser.id.toString(),
        access_token: accessToken,
        token_type: 'bearer',
        scope: tokens.data.scope || ''
      },
      update: {
        access_token: accessToken,
        scope: tokens.data.scope || ''
      }
    })

    // Create session
    const sessionToken = generateRandomSessionToken()
    const session = await createSession(sessionToken, user.id)

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/', request.url))

    // Set session cookie
    await setSessionCookie(sessionToken, session.expires, response)

    return response
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', request.url)
    )
  }
}
