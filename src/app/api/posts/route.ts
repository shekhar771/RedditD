import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PostType } from '@/app/types/post'
import { getServerSession } from '@/lib/server-auth'

// Cache settings
const CACHE_DURATION = 300 // 5 minutes
const MAX_PAGE_SIZE = 50

export async function GET (request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const subredditName = searchParams.get('subreddit')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    parseInt(searchParams.get('pageSize') || '10')
  )
  const sort = searchParams.get('sort') || 'new'
  const types = searchParams.get('types')?.split(',') as PostType[] | undefined
  if (!subredditName) {
    return NextResponse.json(
      { error: 'Subreddit name is required' },
      { status: 400 }
    )
  }

  try {
    // Check if subreddit exists first to avoid unnecessary queries
    const subredditExists = await prisma.subreddit.findUnique({
      where: { name: subredditName },
      select: { id: true }
    })

    if (!subredditExists) {
      return NextResponse.json(
        { error: 'Subreddit not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'public, s-maxage=60' // Cache 404s briefly
          }
        }
      )
    }

    const where: any = {
      subredditId: subredditExists.id // Use ID for better performance than name
    }

    if (types?.length) {
      where.type = { in: types }
    }

    // Get session for personalized voting data
    const session = await getServerSession()
    const userId = session?.user?.id

    let orderBy: any
    switch (sort) {
      case 'new':
        orderBy = { createdAt: 'desc' }
        break
      case 'hot':
        // Implement basic "hot" algorithm (score / age in hours)
        orderBy = [
          {
            Vote: {
              _count: 'desc'
            }
          },
          { createdAt: 'desc' }
        ]
        break
      case 'top':
        // For top posts, order by vote count
        orderBy = [
          {
            Vote: {
              _count: 'desc'
            }
          },
          { createdAt: 'desc' }
        ]
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Use transaction for consistent data
    const [posts, totalPosts] = await prisma.$transaction([
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
          authorId: true, // Include for permission checks

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
              name: true,
              image: true // Include subreddit image if available
            }
          },
          // Optimize comment count - don't fetch all comments
          _count: {
            select: {
              comment: true
            }
          },
          // Only fetch user's votes for personalization
          Vote: userId
            ? {
                where: {
                  userId: userId
                },
                select: {
                  type: true
                }
              }
            : false
        }
      }),
      // Only count total if first page (for pagination)
      page === 1 ? prisma.post.count({ where }) : Promise.resolve(-1)
    ])

    // Transform data to match expected format
    const transformedPosts = posts.map(post => ({
      ...post,
      comment: Array.from({ length: post._count.comment }, (_, i) => ({
        id: `dummy-${i}`
      })),
      // Add vote summary if needed
      voteSummary: post.Vote ? post.Vote[0]?.type : null
    }))

    const response = {
      posts: transformedPosts,
      hasMore: posts.length === pageSize,
      totalPosts: totalPosts === -1 ? undefined : totalPosts
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=600`,
        'X-Subreddit': subredditName,
        'X-Page': page.toString()
      }
    })
  } catch (error) {
    console.error('Error fetching subreddit posts:', error)

    // More detailed error in development
    const isDev = process.env.NODE_ENV === 'development'
    const errorDetails =
      isDev && error instanceof Error ? error.message : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch posts',
        ...(errorDetails && { details: errorDetails })
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store' // Don't cache errors
        }
      }
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS () {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
