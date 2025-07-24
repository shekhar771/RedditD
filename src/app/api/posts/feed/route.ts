import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/server-auth'
import { PostType } from '@/app/types/post'

// Add caching headers
const CACHE_DURATION = 300; // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 50) // Limit max page size
    const sort = searchParams.get('sort') ?? 'new'
    const types = searchParams.get('types')?.split(',') as PostType[] | undefined
    const filterMode = (searchParams.get('filterMode') as 'subscribed' | 'all') || 'all'

    const session = await getServerSession()
    const user = session?.user

    // Build where clause
    const where: any = {}

    if (types?.length) {
      where.type = { in: types }
    }

    // Optimize subscriptions query
    if (filterMode === 'subscribed' && user) {
      const subscriptions = await prisma.subscription.findMany({
        where: { UserId: user.id },
        select: { subredditId: true },
        // Add caching hint
        cacheStrategy: { ttl: 300 }
      })
      
      if (subscriptions.length === 0) {
        // Return empty result early if user has no subscriptions
        return NextResponse.json({
          posts: [],
          hasMore: false,
          totalPosts: 0
        }, {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=600`
          }
        })
      }
      
      where.subredditId = { in: subscriptions.map(s => s.subredditId) }
    }

    // Optimize ordering
    let orderBy: any
    switch (sort) {
      case 'new':
        orderBy = { createdAt: 'desc' }
        break
      case 'hot':
        // For now, fallback to new - implement hot algorithm later
        orderBy = { createdAt: 'desc' }
        break
      case 'top':
        // For now, fallback to new - implement vote counting later
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Use transaction for better performance and consistency
    const [posts, totalPosts] = await prisma.$transaction([
      // Optimized query with minimal data selection
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          type: true,
          tag: true,
          createdAt: true,
          imageUrl: true,
          imageAlt: true,
          linkUrl: true,
          linkMeta: true,
          content: true,
          authorId: true, // Include for delete permission check
          
          author: {
            select: { 
              id: true, 
              username: true, 
              name: true, 
              image: true 
            }
          },
          subreddit: {
            select: { 
              id: true, 
              name: true, 
              image: true 
            }
          },
          // Optimize comment count - just count, don't fetch all
          _count: {
            select: {
              comment: true
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
      
      // Only count total if it's the first page (for pagination)
      page === 1 ? prisma.post.count({ where }) : Promise.resolve(-1)
    ])

    // Transform the data to match expected format
    const transformedPosts = posts.map(post => ({
      ...post,
      comment: Array.from({ length: post._count.comment }, (_, i) => ({ id: `dummy-${i}` }))
    }))

    const response = {
      posts: transformedPosts,
      hasMore: posts.length === pageSize, // Simplified check
      totalPosts: totalPosts === -1 ? undefined : totalPosts
    }

    return NextResponse.json(response, {
      headers: {
        // Add caching headers for better performance
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=600`,
        // Add performance hints
        'X-Posts-Count': posts.length.toString(),
        'X-Page': page.toString()
      }
    })

  } catch (error) {
    console.error('Feed API error:', error)
    
    // Return more detailed error in development
    const isDev = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        ...(isDev && { details: error instanceof Error ? error.message : String(error) })
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}