import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PostType } from '@/app/types/post'

export async function GET (request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const subredditName = searchParams.get('subreddit')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '5')
  const sort = searchParams.get('sort') || 'new'
  const filter = searchParams.get('filter') as PostType | null

  console.log('Received request with params:', {
    subredditName,
    page,
    pageSize,
    sort,
    filter
  })

  if (!subredditName) {
    return NextResponse.json(
      { error: 'Subreddit name is required' },
      { status: 400 }
    )
  }

  // Validate filter
  if (filter && !Object.values(PostType).includes(filter)) {
    return NextResponse.json(
      { error: 'Invalid post type filter' },
      { status: 400 }
    )
  }

  try {
    const where: any = {
      subreddit: {
        name: subredditName
      }
    }

    if (filter) {
      where.type = filter
    }

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
      case 'new':
      default:
        orderBy = {
          createdAt: 'desc'
        }
    }

    console.log('Executing query with:', { where, orderBy })

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
        comment: true,
        Vote: true
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy
    })

    const totalPosts = await prisma.post.count({ where })

    console.log(`Fetched ${posts.length} of ${totalPosts} posts`)

    return NextResponse.json({
      posts,
      hasMore: page * pageSize < totalPosts,
      totalPosts
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
