import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PostType } from '@/app/types/post'

export async function GET (request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const subredditName = searchParams.get('subreddit')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const sort = searchParams.get('sort') || 'new'
  const types = searchParams.get('types')?.split(',') as PostType[] | undefined

  if (!subredditName) {
    return NextResponse.json(
      { error: 'Subreddit name is required' },
      { status: 400 }
    )
  }

  try {
    const where: any = {
      subreddit: {
        name: subredditName
      }
    }

    if (types?.length) {
      where.type = { in: types }
    }

    let orderBy: any
    switch (sort) {
      case 'new':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' } // fallback instead of Vote._count
    }

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          tag: true,
          createdAt: true,
          imageUrl: true,
          imageAlt: true,
          linkUrl: true,
          linkMeta: true,

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
              id: true
            }
          },
          Vote: {
            select: {
              type: true,
              userId: true
            }
          }
        }
      }),

      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      hasMore: page * pageSize < totalPosts,
      totalPosts
    })
  } catch (error) {
    console.error('Error fetching subreddit posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
