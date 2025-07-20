import { NextResponse, NextRequest } from 'next/server'
import { withAuth } from '@/lib/server-auth'
import { prisma } from '@/lib/db'

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const postId = req.nextUrl.pathname.match(/\/posts\/([^\/]+)\/delete/)?.[1]

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Verify post exists and belongs to user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, subreddit: { select: { name: true } } }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      )
    }

    // Perform deletion in transaction
    await prisma.$transaction(
      [
        prisma.vote.deleteMany({ where: { postId } }),
        prisma.commentVote.deleteMany({
          where: { comment: { postId } }
        }),
        prisma.comment.deleteMany({ where: { postId } }),
        prisma.post.delete({ where: { id: postId } })
      ],
      { timeout: 10000 }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Post deleted successfully',
        deletedPostId: postId,
        subredditName: post.subreddit.name
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    )
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
