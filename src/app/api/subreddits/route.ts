// app/api/subreddits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { useAuth } from '@/app/components/AuthProvider'
import { withAuth } from '@/lib/server-auth'

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const userId = user?.id

    const subreddits = await prisma.subreddit.findMany({
      include: {
        Subscribers: true,
        Creator: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        Subscribers: {
          _count: 'desc'
        }
      }
    })

    const formattedSubreddits = subreddits.map(subreddit => ({
      id: subreddit.id,
      name: subreddit.name,
      description: subreddit.description,
      image: subreddit.image,
      backgroundImage: subreddit.backgroundImage,
      subscribers: subreddit.Subscribers.length,
      isSubscribed: userId
        ? subreddit.Subscribers.some(sub => sub.UserId === userId)
        : false
    }))

    return NextResponse.json(formattedSubreddits)
  } catch (error) {
    return NextResponse.json(
      { error: 'Could not fetch subreddits' },
      { status: 500 }
    )
  }
})
