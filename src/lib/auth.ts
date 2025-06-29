import { GitHub } from 'arctic'
import { Google } from 'arctic'

export const baseUrl = 'https://redditd.vercel.app'
// ? `https://${process.env.VERCEL_URL}`
// : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  `${baseUrl}/api/auth/github/callback`
)

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${baseUrl}/api/auth/google/callback`
)
