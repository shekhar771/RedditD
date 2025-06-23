// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/server-auth'
import { prisma } from '@/lib/db'

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    // Validate request
    if (!req.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const { content, postId, replyToId } = requestData

    // Validate required fields
    if (!content?.trim() || !postId) {
      return NextResponse.json(
        { error: 'Content and postId are required' },
        { status: 400 }
      )
    }

    // Create the comment with explicit timestamps
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id,
        replyToID: replyToId || null,
        createdAt: new Date(), // Explicitly set
        updatedAt: new Date() // Explicitly set
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        votes: true
      }
    })

    return NextResponse.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error creating comment:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        error: 'Failed to create comment',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined
      },
      { status: 500 }
    )
  }
})
