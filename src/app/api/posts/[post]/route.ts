import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET (
  request: Request,
  { params }: { params: Promise<{ post: string }> } // params is now a Promise
) {
  try {
    // Await the params object first
    const resolvedParams = await params

    // Add debugging
    console.log('API Route - Full params object:', resolvedParams)
    console.log('API Route - post from params:', resolvedParams.post)
    console.log('API Route - Request URL:', request.url)

    if (!resolvedParams.post) {
      console.log('API Route - No post ID provided')
      return NextResponse.json(
        { error: 'Post ID is required', receivedParams: resolvedParams },
        { status: 400 }
      )
    }

    // Validate post ID format
    if (
      typeof resolvedParams.post !== 'string' ||
      resolvedParams.post.trim().length === 0
    ) {
      console.log('API Route - Invalid post ID format:', resolvedParams.post)
      return NextResponse.json(
        {
          error: 'Invalid Post ID format',
          receivedPostId: resolvedParams.post
        },
        { status: 400 }
      )
    }

    console.log(
      'API Route - Attempting to fetch post with ID:',
      resolvedParams.post
    )

    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.post },
      include: {
        author: true,
        subreddit: true,
        comment: {
          include: {
            author: true,
            votes: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        Vote: true
      }
    })

    if (!post) {
      console.log('API Route - Post not found for ID:', resolvedParams.post)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    console.log('API Route - Successfully found post:', post.id)
    return NextResponse.json(post)
  } catch (error) {
    console.error('API Route - Error fetching post:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
