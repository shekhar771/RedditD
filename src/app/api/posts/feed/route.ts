// api/posts/feed/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/server-auth'
import { PostType } from '@/app/types/post'

export async function GET (req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '5')
    const sort =
      (searchParams.get('sort') as 'new' | 'top' | 'controversial' | 'hot') ||
      'hot'
    const typesParam = searchParams.get('types')
    const types = typesParam ? (typesParam.split(',') as PostType[]) : undefined
    const filterMode =
      (searchParams.get('filterMode') as 'subscribed' | 'all') || 'all'

    const session = await getServerSession()
    const user = session?.user

    // Base where clause
    const where: any = {}

    // Apply post type filter
    if (types && types.length > 0) {
      where.type = { in: types }
    }

    // Apply subscription filter if needed
    if (filterMode === 'subscribed' && user) {
      const subscriptions = await prisma.subscription.findMany({
        where: { UserId: user.id },
        select: { subredditId: true }
      })

      where.subredditId = {
        in: subscriptions.map(sub => sub.subredditId)
      }
    }

    // Determine orderBy based on sort option
    let orderBy: any
    switch (sort) {
      case 'top':
        orderBy = {
          Vote: {
            _count: 'desc'
          }
        }
        break
      case 'controversial':
        orderBy = [
          {
            Vote: {
              _count: 'desc'
            }
          },
          {
            createdAt: 'desc'
          }
        ]
        break
      case 'hot':
        orderBy = [
          {
            Vote: {
              _count: 'desc'
            }
          },
          {
            createdAt: 'desc'
          }
        ]
        break
      case 'new':
      default:
        orderBy = {
          createdAt: 'desc'
        }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        subreddit: {
          select: {
            id: true,
            name: true
          }
        },
        comment: {
          select: {
            id: true // Or _count if you only need comment count
          }
        },
        Vote: {
          select: {
            type: true,
            userId: true
          }
        }
      },
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize
    })

    const totalPosts = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
      hasMore: page * pageSize < totalPosts,
      totalPosts
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      {
        error: 'Could not fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
