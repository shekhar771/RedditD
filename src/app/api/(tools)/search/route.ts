// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET (request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() || ''

  try {
    const [users, subreddits, posts] = await Promise.all([
      // Search users
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),

      // Search subreddits
      prisma.subreddit.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        take: 5
      }),

      // Search posts
      prisma.post.findMany({
        where: {
          title: { contains: query, mode: 'insensitive' }
        },
        include: {
          subreddit: true,
          author: true
        },
        take: 5
      })
    ])

    return NextResponse.json({
      users: users || [],
      subreddits: subreddits || [],
      posts: posts || []
    })
  } catch (error) {
    return NextResponse.json(
      {
        users: [],
        subreddits: [],
        posts: []
      },
      { status: 500 }
    )
  }
}
